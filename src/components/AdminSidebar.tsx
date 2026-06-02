"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/components/AdminContext";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Award,
  MessageSquare,
  Star,
  LogOut,
  Bell,
  Users,
  Clock,
  BookOpen,
  Calculator,
  Layers,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, role, user } = useAdmin();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/notifications?email=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.notifications) {
          const unread = data.notifications.filter((n: any) => !n.readBy.includes(user.email)).length;
          setUnreadCount(unread);
        }
      })
      .catch(err => console.error(err));
  }, [user?.email, pathname]);

  // Determine what links to show based on role
  const isSuper = role === "superadmin";
  const isAdmin = role === "admin" || isSuper;
  const isAccountant = role === "accountant";
  const isStaff = role === "staff";
  const isInstructor = role === "instructor";
  const isStudent = role === "student";

  const overviewItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard }
  ];

  // Everyone (including students) gets Chat Center
  if (role !== "guest") {
    overviewItems.push({ href: "/admin/chat", label: "Chat Center", icon: MessageSquare });
    overviewItems.push({ href: "/admin/notifications", label: "Notifications", icon: Bell });
  }

  const managementItems = [];
  if (isAdmin || isInstructor) {
    managementItems.push({ href: "/admin/programs", label: "Programs", icon: BookOpen });
    managementItems.push({ href: "/admin/batches", label: "Batches", icon: Layers });
  }
  if (isAdmin) {
    managementItems.push({ href: "/admin/credentials", label: "Credentials", icon: Award });
    managementItems.push({ href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare });
    managementItems.push({ href: "/admin/testimonials", label: "Testimonials", icon: Star });
  }

  const organizationItems = [];
  if (!isStudent) {
    if (isAdmin || isAccountant) {
      organizationItems.push({ href: "/admin/team", label: "Team Directory", icon: Users });
    }
    organizationItems.push({ href: "/admin/attendance", label: "Attendance", icon: Clock });
    
    if (isStaff || isInstructor || isAdmin) {
      organizationItems.push({ href: "/admin/students", label: "Students", icon: Users });
    }
    if (isInstructor || isAdmin) {
      organizationItems.push({ href: "/admin/syllabus", label: "Syllabus", icon: BookOpen });
    }
    
    organizationItems.push({ href: "/admin/payroll", label: "Payroll", icon: Calculator });
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-zinc-800/50 bg-zinc-950">
      {/* ── Branding ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-zinc-800/50 px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="Sandevex Logo" className="h-6 w-auto brightness-0 invert" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Admin</span>
        </Link>
      </div>

      {/* ── Navigation ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        <div className="mb-6">
          <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Overview
          </h3>
          <div className="space-y-1">
            {overviewItems.map((item) => {
              const isActive = item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#18cb96]/10 text-[#18cb96]"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  {item.href === "/admin/notifications" && unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-[10px] font-bold text-red-400">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {managementItems.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Management
            </h3>
            <div className="space-y-1">
              {managementItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#18cb96]/10 text-[#18cb96]"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {organizationItems.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Organization
            </h3>
            <div className="space-y-1">
              {organizationItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#18cb96]/10 text-[#18cb96]"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── User / Logout ──────────────────────────────────────── */}
      <div className="border-t border-zinc-800/50 p-4">
        {user && (
          <div className="mb-3 rounded-xl bg-zinc-900/80 px-3 py-2.5">
            <p className="truncate text-xs font-medium text-zinc-300">
              {user.email}
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-500 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-[18px] w-[18px] transition-colors group-hover:text-red-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
