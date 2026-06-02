"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { Bell, Send, CheckCircle2, Trash2, ShieldAlert, Loader2, Info, AlertTriangle, Zap, X } from "lucide-react";
import { useAdmin } from "@/components/AdminContext";

interface UserOption {
  email: string;
  name?: string;
}

interface Notification {
  docId: string;
  title: string;
  message: string;
  type: string;
  target: string;
  readBy: string[];
  createdAt: string;
}

const TYPES = ["Notice", "Alert", "Note", "Action"];

export default function NotificationsPage() {
  const { user, role } = useAdmin();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Compose Form
  const [form, setForm] = useState({ title: "", message: "", type: "Notice", target: "All" });
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchData = useCallback(async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const [notifRes, usersRes] = await Promise.all([
        fetch(`/api/notifications?email=${encodeURIComponent(user.email)}`),
        (role === "admin" || role === "superadmin") ? fetch("/api/users") : Promise.resolve({ json: () => ({ users: [] }) })
      ]);
      
      const notifData = await notifRes.json();
      setNotifications(notifData.notifications || []);

      if (role === "admin" || role === "superadmin") {
        const usersData = await (usersRes as Response).json();
        setUsers(usersData.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.email, role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCompose = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to send");
      setToast({ message: "Notification sent successfully", type: "success" });
      setForm({ title: "", message: "", type: "Notice", target: "All" });
      fetchData();
    } catch {
      setToast({ message: "Failed to send notification", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user?.email) return;
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "Alert": return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case "Action": return <Zap className="h-5 w-5 text-amber-400" />;
      case "Note": return <Info className="h-5 w-5 text-blue-400" />;
      default: return <Bell className="h-5 w-5 text-[#18cb96]" />;
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("en-US", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in-up">
          <div className={`flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-2xl backdrop-blur-xl ${
            toast.type === "success" ? "border-emerald-500/20 bg-emerald-950/90 text-emerald-300" : "border-red-500/20 bg-red-950/90 text-red-300"
          }`}>
            <CheckCircle2 className="h-5 w-5" />
            <p className="text-sm font-medium">{toast.message}</p>
            <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Notifications</h1>
          <p className="mt-1 text-sm text-zinc-500">System alerts and team communication</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Compose Section (Admins only) */}
        {(role === "admin" || role === "superadmin") && (
          <div className="lg:col-span-1 h-fit rounded-2xl border border-zinc-800/60 bg-zinc-900/80 p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Send className="h-5 w-5 text-[#18cb96]" />
              Compose Notice
            </h2>
            <form onSubmit={handleCompose} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Target Audience</label>
                <select value={form.target} onChange={e => setForm({...form, target: e.target.value})} className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white focus:border-[#18cb96]/50 outline-none">
                  <option value="All">All Users</option>
                  {users.map(u => (
                    <option key={u.email} value={u.email}>{u.name || u.email}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Notice Type</label>
                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white focus:border-[#18cb96]/50 outline-none">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="E.g., System Maintenance" className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white focus:border-[#18cb96]/50 outline-none" />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Message</label>
                <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} required rows={4} placeholder="Type your message here..." className="w-full resize-none rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white focus:border-[#18cb96]/50 outline-none" />
              </div>

              <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#18cb96] to-[#059669] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#18cb96]/20 transition-all hover:shadow-xl hover:shadow-[#18cb96]/30 disabled:opacity-60">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Notification
              </button>
            </form>
          </div>
        )}

        {/* Inbox Section */}
        <div className={`rounded-2xl border border-zinc-800/60 bg-zinc-900/80 p-6 ${(role === "admin" || role === "superadmin") ? "lg:col-span-2" : "lg:col-span-3"}`}>
          <h2 className="text-lg font-bold text-white mb-6">Inbox</h2>
          
          {loading ? (
            <div className="flex h-48 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#18cb96]" /></div>
          ) : notifications.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center">
              <Bell className="mb-3 h-10 w-10 text-zinc-700" />
              <p className="text-sm text-zinc-500">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notif => {
                const isRead = notif.readBy.includes(user?.email || "");
                return (
                  <div key={notif.docId} className={`group relative flex gap-4 rounded-xl border p-4 transition-all ${isRead ? "border-zinc-800/40 bg-zinc-900/30 opacity-75" : "border-zinc-700/50 bg-zinc-800/40"}`}>
                    {!isRead && <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-[#18cb96] animate-pulse" />}
                    
                    <div className="mt-1 flex-shrink-0">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 shadow-inner ${!isRead && "ring-1 ring-[#18cb96]/30"}`}>
                        {getIcon(notif.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 pr-8">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{notif.type}</span>
                        <span className="text-[10px] text-zinc-600">•</span>
                        <span className="text-[10px] font-medium text-zinc-500">{formatDate(notif.createdAt)}</span>
                        {notif.target === "All" && (
                          <>
                            <span className="text-[10px] text-zinc-600">•</span>
                            <span className="text-[10px] font-bold text-[#18cb96]">BROADCAST</span>
                          </>
                        )}
                      </div>
                      <h3 className={`mt-1 text-sm font-bold ${isRead ? "text-zinc-300" : "text-white"}`}>{notif.title}</h3>
                      <p className="mt-1 text-sm text-zinc-400">{notif.message}</p>
                      
                      <div className="mt-4 flex items-center gap-3">
                        {!isRead && (
                          <button onClick={() => markAsRead(notif.docId)} className="flex items-center gap-1.5 text-xs font-semibold text-[#18cb96] hover:text-[#059669]">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Read
                          </button>
                        )}
                        {(role === "admin" || role === "superadmin") && (
                          <button onClick={() => handleDelete(notif.docId)} className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-3.5 w-3.5" /> Delete Global
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
