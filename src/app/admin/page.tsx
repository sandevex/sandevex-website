"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Award,
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  ArrowUpRight,
  AlertCircle,
  Loader2,
  Users,
  ShieldCheck,
  Activity,
  Calculator,
  IndianRupee,
  FileText,
  UserCheck,
  BookOpen,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useAdmin } from "@/components/AdminContext";

/* ─── Stats Card Component ────────────────────────────────────── */
interface StatsCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: any;
  gradient: string;
  glow: string;
  href: string;
  delay: number;
}

function StatsCard({ label, value, sub, icon: Icon, gradient, glow, href, delay }: StatsCardProps) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-md p-6 shadow-xl ${glow} transition-all duration-300 hover:border-zinc-700/60 hover:shadow-2xl animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${gradient} opacity-80`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-white">{value}</p>
          {sub && <p className="mt-1 text-xs font-semibold text-zinc-400">{sub}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} opacity-90 shadow-lg`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-zinc-500 transition-colors group-hover:text-[#18cb96]">
        Explore panel
        <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}

/* ─── Dashboard Page ───────────────────────────────────────────── */
export default function AdminDashboard() {
  const { user, role, isAdmin } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Stats
  const [globalStats, setGlobalStats] = useState({
    credentials: 0,
    students: 0,
    staff: 0,
    payrollSum: 0,
  });

  const [personalStats, setPersonalStats] = useState({
    loggedHours: 0,
    expectedPay: 0,
    assignedStudents: 0,
    hourlyRate: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Ticking 12-Hour Clock
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
      setDateStr(now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      setError("");

      const date = new Date();
      const currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const isAdminOrAccountant = role === "admin" || role === "superadmin" || role === "accountant";

      if (isAdminOrAccountant) {
        // Admin or Accountant global fetch
        const [credRes, studRes, usersRes, payrollRes, testRes] = await Promise.all([
          fetch("/api/credentials"),
          fetch(`/api/students?role=${role}&email=${encodeURIComponent(user.email)}`),
          fetch("/api/users"),
          fetch(`/api/payroll?month=${currentMonth}&role=${role}&email=${encodeURIComponent(user.email)}`),
          fetch("/api/testimonials?all=true")
        ]);

        const credData = await credRes.json();
        const studData = await studRes.json();
        const usersData = await usersRes.json();
        const payrollData = await payrollRes.json();
        const testData = await testRes.json();

        const credList = credData.credentials || [];
        const studList = studData.students || [];
        const staffList = usersData.users || [];
        const payrollList = payrollData.payroll || [];
        const testList = testData.testimonials || [];

        // Sum up monthly payroll payout
        const payoutTotal = payrollList.reduce((acc: number, curr: any) => acc + Number(curr.totalPay || 0), 0);

        setGlobalStats({
          credentials: credList.length,
          students: studList.length,
          staff: staffList.length,
          payrollSum: parseFloat(payoutTotal.toFixed(2)),
        });

        // Assemble recent events
        const events: any[] = [];
        credList.slice(0, 3).forEach((c: any) => {
          events.push({
            type: "credential",
            title: `Credential Registered`,
            desc: `${c.name} - ${c.course}`,
            time: c.createdAt || c.issueDate,
            badge: c.status || "Active",
            color: "emerald"
          });
        });
        testList.slice(0, 2).forEach((t: any) => {
          events.push({
            type: "testimonial",
            title: `Graduate Testimonial`,
            desc: `${t.author} - ${t.course}`,
            time: t.createdAt || new Date().toISOString(),
            badge: t.approved ? "Approved" : "Pending",
            color: t.approved ? "emerald" : "amber"
          });
        });

        events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setRecentActivity(events.slice(0, 5));
      } else {
        // Staff or Instructor self-service fetch
        const [attendanceRes, studRes, payrollRes] = await Promise.all([
          fetch(`/api/attendance?email=${encodeURIComponent(user.email)}&role=${role}`),
          fetch(`/api/students?role=${role}&email=${encodeURIComponent(user.email)}`),
          fetch(`/api/payroll?month=${currentMonth}&role=${role}&email=${encodeURIComponent(user.email)}`)
        ]);

        const attendanceData = await attendanceRes.json();
        const studData = await studRes.json();
        const payrollData = await payrollRes.json();

        const attLogs = attendanceData.logs || [];
        const studentsEnrolled = studData.students || [];
        const payrollRecord = payrollData.payroll?.[0] || {};

        // Calculate hours for this month
        const currentMonthPrefix = currentMonth.slice(0, 7); // "YYYY-MM"
        const monthlyLogs = attLogs.filter((log: any) => log.date?.startsWith(currentMonthPrefix));
        const totalLoggedHours = monthlyLogs.reduce((acc: number, curr: any) => acc + Number(curr.totalHours || 0), 0);

        setPersonalStats({
          loggedHours: parseFloat(totalLoggedHours.toFixed(2)),
          expectedPay: payrollRecord.totalPay || 0,
          assignedStudents: studentsEnrolled.length,
          hourlyRate: payrollRecord.hourlyRate || 0,
        });

        // Assemble personal logs activity
        const events = attLogs.slice(0, 5).map((log: any) => ({
          type: "attendance",
          title: log.status === "Working" ? "Shift Active" : "Shift Logged",
          desc: `${log.totalHours || 0} hrs mapped on ${log.date}`,
          time: log.updatedAt || log.clockIn,
          badge: log.status || "Completed",
          color: log.status === "Working" ? "amber" : "emerald"
        }));
        setRecentActivity(events);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to compile dashboard metrics.");
    } finally {
      setLoading(false);
    }
  }, [user?.email, role]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#18cb96]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center text-white">
        <AlertCircle className="h-12 w-12 text-rose-400" />
        <p className="text-lg font-bold text-rose-400">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="rounded-xl bg-zinc-800 px-5 py-2.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700 transition"
        >
          Reload Dashboard
        </button>
      </div>
    );
  }

  const isAdminOrAccountant = role === "admin" || role === "superadmin" || role === "accountant";

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto">
      
      {/* ── Ticking Digital Clock Hero Banner ───────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 h-48 w-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full uppercase">
            ERP Platform Live Registry
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent mt-1">
            Welcome back, {user?.displayName || "Member"}
          </h1>
          <p className="text-zinc-400 text-xs font-medium">
            Role Authorization: <span className="text-emerald-400 font-bold uppercase tracking-wider">{role || "Staff"}</span> &bull; Status: Connected
          </p>
        </div>

        {/* Premium Ticking Clock */}
        <div className="flex flex-col items-start md:items-end justify-center bg-zinc-950/60 border border-zinc-800/80 px-6 py-4 rounded-2xl shadow-inner min-w-[200px] z-10 relative backdrop-blur-sm">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Clock size={11} className="text-emerald-400" />
            Standard Time (12-Hour)
          </span>
          <div className="text-2xl font-black font-mono tracking-wider text-emerald-400 drop-shadow-[0_0_8px_rgba(24,203,150,0.2)]">
            {timeStr}
          </div>
          <div className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">
            {dateStr}
          </div>
        </div>
      </div>

      {/* ── Stats Display Grid ─────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isAdminOrAccountant ? (
          <>
            <StatsCard
              label="Verified Credentials"
              value={globalStats.credentials}
              sub="Secure graduation ledgers"
              icon={Award}
              gradient="from-emerald-400 to-[#059669]"
              glow="shadow-emerald-500/5"
              href="/admin/credentials"
              delay={0}
            />
            <StatsCard
              label="Student Registries"
              value={globalStats.students}
              sub="Active LMS course tracking"
              icon={Users}
              gradient="from-blue-400 to-blue-600"
              glow="shadow-blue-500/5"
              href="/admin/students"
              delay={100}
            />
            <StatsCard
              label="Active Staff Directory"
              value={globalStats.staff}
              sub="Platform access clearances"
              icon={ShieldCheck}
              gradient="from-purple-500 to-indigo-600"
              glow="shadow-purple-500/5"
              href="/admin/team"
              delay={200}
            />
            <StatsCard
              label="Monthly Payroll Payout"
              value={`₹ ${globalStats.payrollSum.toLocaleString("en-IN")}`}
              sub="Statutory compensation log"
              icon={IndianRupee}
              gradient="from-amber-400 to-orange-500"
              glow="shadow-amber-500/5"
              href="/admin/payroll"
              delay={300}
            />
          </>
        ) : (
          <>
            <StatsCard
              label="Tracked Log Hours"
              value={`${personalStats.loggedHours} hrs`}
              sub="Accumulated shift time"
              icon={Clock}
              gradient="from-emerald-400 to-[#059669]"
              glow="shadow-emerald-500/5"
              href="/admin/attendance"
              delay={0}
            />
            <StatsCard
              label="Expected Wages"
              value={`₹ ${personalStats.expectedPay.toLocaleString("en-IN")}`}
              sub="Calculated monthly payout"
              icon={IndianRupee}
              gradient="from-amber-400 to-orange-500"
              glow="shadow-amber-500/5"
              href="/admin/payroll"
              delay={100}
            />
            <StatsCard
              label="Assigned Class Size"
              value={personalStats.assignedStudents}
              sub="Direct roster mapping"
              icon={Users}
              gradient="from-blue-400 to-blue-600"
              glow="shadow-blue-500/5"
              href="/admin/students"
              delay={200}
            />
            <StatsCard
              label="Assigned Rate"
              value={`₹ ${personalStats.hourlyRate}/hr`}
              sub="Contract base standard"
              icon={Calculator}
              gradient="from-purple-500 to-indigo-600"
              glow="shadow-purple-500/5"
              href="/admin/payroll"
              delay={300}
            />
          </>
        )}
      </div>

      {/* ── Redesigned Content & Activity Grid ─────────────────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        
        {/* Recent Activity Section */}
        <div className="lg:col-span-3 rounded-3xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Platform Operations Feed</h2>
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-800">
              Live updates
            </span>
          </div>

          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="mb-3 h-10 w-10 text-zinc-700" />
              <p className="text-sm text-zinc-500">No operations recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {recentActivity.map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-800/40 bg-zinc-900/30 p-3.5 hover:bg-zinc-800/30 transition-all group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700">
                      {event.type === "credential" ? (
                        <Award size={16} className="text-emerald-400" />
                      ) : event.type === "attendance" ? (
                        <Clock size={16} className="text-amber-400" />
                      ) : (
                        <Star size={16} className="text-blue-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-zinc-200 truncate">{event.title}</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 truncate">{event.desc}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                      event.color === "amber" 
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}>
                      {event.badge}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {new Date(event.time).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md p-6">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">System Actions</h2>
            </div>

            <div className="space-y-3">
              {isAdminOrAccountant ? (
                <>
                  <Link
                    href="/admin/credentials"
                    className="group flex items-center gap-3.5 rounded-2xl border border-zinc-800/40 bg-zinc-900/30 px-4 py-3.5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Register Credentials</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Publish & audit secure PDF certificates</p>
                    </div>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-zinc-600 transition-colors group-hover:text-emerald-400" />
                  </Link>

                  <Link
                    href="/admin/team"
                    className="group flex items-center gap-3.5 rounded-2xl border border-zinc-800/40 bg-zinc-900/30 px-4 py-3.5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Team Statutory Directory</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Edit PF/ESI and banking profiles</p>
                    </div>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-zinc-600 transition-colors group-hover:text-purple-400" />
                  </Link>

                  <Link
                    href="/admin/payroll"
                    className="group flex items-center gap-3.5 rounded-2xl border border-zinc-800/40 bg-zinc-900/30 px-4 py-3.5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Calculator className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Calculate Wages ledger</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Audit payouts and print A4 payslips</p>
                    </div>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-zinc-600 transition-colors group-hover:text-amber-400" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/admin/attendance"
                    className="group flex items-center gap-3.5 rounded-2xl border border-zinc-800/40 bg-zinc-900/30 px-4 py-3.5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">Log Daily Shift Hours</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Track multi clock-ins with notes</p>
                    </div>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-zinc-600 transition-colors group-hover:text-emerald-400" />
                  </Link>

                  {role === "instructor" && (
                    <Link
                      href="/admin/attendance"
                      className="group flex items-center gap-3.5 rounded-2xl border border-zinc-800/40 bg-zinc-900/30 px-4 py-3.5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-200">Mark Student Attendance</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Update daily present/absent checksheet</p>
                      </div>
                      <ArrowUpRight className="ml-auto h-4 w-4 text-zinc-600 transition-colors group-hover:text-blue-400" />
                    </Link>
                  )}

                  <Link
                    href="/admin/payroll"
                    className="group flex items-center gap-3.5 rounded-2xl border border-zinc-800/40 bg-zinc-900/30 px-4 py-3.5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-200">My Wage Sheets & Payslips</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Download approved statutory records</p>
                    </div>
                    <ArrowUpRight className="ml-auto h-4 w-4 text-zinc-600 transition-colors group-hover:text-amber-400" />
                  </Link>

                  {role === "instructor" && (
                    <Link
                      href="/admin/syllabus"
                      className="group flex items-center gap-3.5 rounded-2xl border border-zinc-800/40 bg-zinc-900/30 px-4 py-3.5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-200">Syllabus Pipeline</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Draft or edit syllabus frameworks</p>
                      </div>
                      <ArrowUpRight className="ml-auto h-4 w-4 text-zinc-600 transition-colors group-hover:text-purple-400" />
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Secure Platform Status */}
          <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md p-6">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">ERP Security Clearances</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-zinc-950/40 px-4 py-3 border border-zinc-900">
                <span className="text-xs text-zinc-400 font-medium">Database Node Connection</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-zinc-950/40 px-4 py-3 border border-zinc-900">
                <span className="text-xs text-zinc-400 font-medium">Platform SSL & Registry</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Verified Secure
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
