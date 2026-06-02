"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminProvider, useAdmin } from "@/components/AdminContext";
import { Shield, Loader2, ArrowRight, Lock, Mail, AlertCircle, Compass } from "lucide-react";

function LoginContent() {
  const { login, logout, isAdmin, role, loading } = useAdmin();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect to dashboard if already authenticated with a valid role
  useEffect(() => {
    if (!loading && isAdmin && role && role !== "guest") {
      router.push("/admin");
    }
  }, [loading, isAdmin, role, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // 1. Try logging in
      await login(email, password);
      
      // Let's delay briefly for auth state listener context sync
      await new Promise(resolve => setTimeout(resolve, 600));
    } catch (err: unknown) {
      setSubmitting(false);
      const message = err instanceof Error ? err.message : "Authentication failed.";
      if (message.includes("auth/invalid-credential") || message.includes("auth/user-not-found")) {
        setError("Invalid email address or password.");
      } else if (message.includes("auth/too-many-requests")) {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(message);
      }
    }
  };

  // Securely intercept unauthorized guest accounts on post-login checks
  useEffect(() => {
    const checkGuestState = async () => {
      if (!submitting) return;
      if (!loading && role === "guest") {
        setError("Access Denied: This email address is not registered in the Sandevex ERP network.");
        setSubmitting(false);
        try {
          await logout();
        } catch (err) {
          console.error("Cleanup logout failed:", err);
        }
      } else if (!loading && isAdmin && role && role !== "guest") {
        setSubmitting(false);
        router.push("/admin");
      }
    };
    
    checkGuestState();
  }, [loading, isAdmin, role, submitting, logout, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#18cb96]" />
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest animate-pulse">Initialising Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
      {/* ── Background Glowing Visuals ────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#18cb96]/5 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-[#059669]/5 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#18cb96]/3 blur-[80px]" />
        
        {/* Decorative Grid Mesh */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Central Login Card ────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-md animate-fade-in-up px-4">
        <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          
          {/* Header Section */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#18cb96] to-[#059669] shadow-lg shadow-[#18cb96]/25 animate-pulse-subtle">
              <Compass className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Sandevex Unified Portal
            </h1>
            <p className="mt-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              LMS & ERP Central Entry
            </p>
            <p className="mt-1 text-[11px] text-zinc-650 leading-normal max-w-[280px] mx-auto">
              Students, Instructors, Staff, and Administrators sign in here for secure access
            </p>
          </div>

          {/* Error Message alert block */}
          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 flex items-start gap-2.5 animate-scale-in">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold text-rose-400 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="e.g. name@domain.com"
                  className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 py-3 pl-11 pr-4 text-xs text-white placeholder-zinc-600 outline-none transition-all focus:border-[#18cb96]/50 focus:ring-2 focus:ring-[#18cb96]/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Secure Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 py-3 pl-11 pr-4 text-xs text-white placeholder-zinc-600 outline-none transition-all focus:border-[#18cb96]/50 focus:ring-2 focus:ring-[#18cb96]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#18cb96] to-[#059669] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#18cb96]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#18cb96]/35 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Enter ERP Portal
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer security tag */}
          <div className="mt-6 border-t border-zinc-800/80 pt-4 text-center">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest flex items-center justify-center gap-1">
              🔒 SECURE LEDGER ENCRYPTED GATEWAY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeneralLoginPage() {
  return (
    <AdminProvider>
      <LoginContent />
    </AdminProvider>
  );
}
