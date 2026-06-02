"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminProvider, useAdmin } from "@/components/AdminContext";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Loader2,
  Bell,
  AlertTriangle,
  Zap,
  Info,
  X,
  CheckCircle2,
} from "lucide-react";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, role, loading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  // Global Toaster State
  const [globalToast, setGlobalToast] = useState<{
    docId: string;
    title: string;
    message: string;
    type: string;
  } | null>(null);

  const seenIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !isAdmin && pathname !== "/admin/login" && pathname !== "/login") {
      router.push("/login");
    }
  }, [loading, isAdmin, pathname, router]);

  // Enforce strict role-based pathname access control
  useEffect(() => {
    if (loading || !isAdmin || !role) return;

    const lowerPath = pathname.toLowerCase();

    // 1. Students can ONLY access Dashboard (/admin), Chat (/admin/chat), and Notifications (/admin/notifications)
    if (role === "student") {
      const allowed = ["/admin", "/admin/chat", "/admin/notifications"];
      if (!allowed.includes(lowerPath)) {
        router.replace("/admin");
      }
    }
    
    // 2. Accountants can ONLY access Dashboard (/admin), Payroll (/admin/payroll), Chat (/admin/chat), and Notifications (/admin/notifications)
    else if (role === "accountant") {
      const allowed = ["/admin", "/admin/payroll", "/admin/chat", "/admin/notifications"];
      if (!allowed.includes(lowerPath)) {
        router.replace("/admin");
      }
    }
    
    // 3. Staff can ONLY access Dashboard (/admin), Attendance (/admin/attendance), Payroll (/admin/payroll), Chat (/admin/chat), and Notifications (/admin/notifications)
    else if (role === "staff") {
      const allowed = ["/admin", "/admin/attendance", "/admin/payroll", "/admin/chat", "/admin/notifications"];
      if (!allowed.includes(lowerPath)) {
        router.replace("/admin");
      }
    }
    
    // 4. Instructors are restricted from Team Statutory Directory, Inquiries, Testimonials, and Credentials
    else if (role === "instructor") {
      const restricted = ["/admin/team", "/admin/inquiries", "/admin/testimonials", "/admin/credentials"];
      const isRestricted = restricted.some(p => lowerPath.startsWith(p));
      if (isRestricted) {
        router.replace("/admin");
      }
    }
  }, [loading, isAdmin, role, pathname, router]);

  // Polling notifications for live top-right popups
  useEffect(() => {
    if (!user?.email || !isAdmin) return;

    let isMounted = true;
    const email = user.email;

    const fetchInitial = async () => {
      try {
        const res = await fetch(
          `/api/notifications?email=${encodeURIComponent(email)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.notifications) {
          data.notifications.forEach((n: any) => {
            seenIdsRef.current.add(n.docId);
          });
        }
      } catch (err) {
        console.error("Failed to fetch initial notifications:", err);
      }
    };

    fetchInitial();

    // Poll every 8 seconds for new, unread announcements
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/notifications?email=${encodeURIComponent(email)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.notifications) return;

        // Find the first notification that is unseen in this session AND unread in the DB
        const newUnread = data.notifications.find((n: any) => {
          const isSeen = seenIdsRef.current.has(n.docId);
          const isRead = n.readBy?.includes(email);
          return !isSeen && !isRead;
        });

        if (newUnread) {
          seenIdsRef.current.add(newUnread.docId);
          setGlobalToast({
            docId: newUnread.docId,
            title: newUnread.title,
            message: newUnread.message,
            type: newUnread.type,
          });
        }
      } catch (err) {
        console.error("Notification polling failed:", err);
      }
    }, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.email, isAdmin]);

  // Auto-hide the global toast after 8 seconds
  useEffect(() => {
    if (globalToast) {
      const timer = setTimeout(() => {
        setGlobalToast(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [globalToast]);

  const handleMarkAsRead = async (id: string) => {
    if (!user?.email) return;
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      setGlobalToast(null);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const getGlobalIcon = (type: string) => {
    switch (type) {
      case "Alert":
        return <AlertTriangle className="h-5 w-5 text-rose-400" />;
      case "Action":
        return <Zap className="h-5 w-5 text-amber-400" />;
      case "Note":
        return <Info className="h-5 w-5 text-blue-400" />;
      default:
        return <Bell className="h-5 w-5 text-[#18cb96]" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-zinc-800" />
            <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-[#18cb96]" />
          </div>
          <p className="text-sm font-medium text-zinc-500">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  if (pathname === "/admin/login" || pathname === "/login") {
    return <>{children}</>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      <AdminSidebar />
      <main className="ml-[260px] min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>

      {/* Global Live Toaster Alert */}
      {globalToast && (
        <div className="fixed top-6 right-6 z-[9999] animate-fade-in-up w-full max-w-sm">
          <div className="flex gap-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-zinc-800/80">
            <div className="mt-0.5 flex-shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-850 shadow-inner">
                {getGlobalIcon(globalToast.type)}
              </div>
            </div>

            <div className="flex-1 pr-6">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                  New {globalToast.type}
                </span>
              </div>
              <h3 className="mt-0.5 text-xs font-extrabold text-white">
                {globalToast.title}
              </h3>
              <p className="mt-0.5 text-xs text-zinc-400 leading-relaxed">
                {globalToast.message}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => handleMarkAsRead(globalToast.docId)}
                  className="flex items-center gap-1 text-[10px] font-bold text-[#18cb96] hover:text-[#059669] transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="h-3 w-3" /> Mark as Read
                </button>
              </div>
            </div>

            <button
              onClick={() => setGlobalToast(null)}
              className="absolute top-3 right-3 text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminGuard>{children}</AdminGuard>
    </AdminProvider>
  );
}
