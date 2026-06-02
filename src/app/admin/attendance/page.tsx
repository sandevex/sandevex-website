"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { Clock, Loader2, Calendar, CheckCircle, AlertCircle, History, Edit2, Search, ChevronDown, ChevronUp, Plus, Trash2, Users, BookOpen, Notebook, User } from "lucide-react";
import { useAdmin } from "@/components/AdminContext";

export default function AttendancePage() {
  const { user, isAdmin, role } = useAdmin();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clocking, setClocking] = useState(false);
  const [clockNote, setClockNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"staff" | "student">("staff");
  
  // Collapsible nested session tracker
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [editSessions, setEditSessions] = useState<any[]>([]);

  // Student Attendance States
  const [programs, setPrograms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [studentAttendance, setStudentAttendance] = useState<{ [key: string]: "Present" | "Absent" }>({});
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Toaster Notifications (Top Right)
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchLogs = useCallback(async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      const url = `/api/attendance?email=${encodeURIComponent(user.email)}&role=${role}`;
      const res = await fetch(url);
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to retrieve attendance logs", "error");
    } finally {
      setLoading(false);
    }
  }, [role, user?.email]);

  const fetchProgramsAndStudents = useCallback(async () => {
    try {
      const progRes = await fetch("/api/programs");
      const progData = await progRes.json();
      setPrograms(progData.programs || []);
      if (progData.programs?.length > 0) {
        setSelectedProgram(progData.programs[0].name);
      }

      const studRes = await fetch(`/api/students?role=${role}&email=${encodeURIComponent(user?.email || "")}`);
      const studData = await studRes.json();
      setStudents(studData.students || []);
    } catch (err) {
      console.error("Error fetching students/programs", err);
    }
  }, [role, user?.email]);

  const fetchStudentAttendanceRecords = useCallback(async () => {
    if (!selectedProgram || !attendanceDate) return;
    try {
      setLoadingStudents(true);
      const res = await fetch(`/api/students/attendance?program=${encodeURIComponent(selectedProgram)}&date=${attendanceDate}`);
      const data = await res.json();
      setStudentAttendance(data.records || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedProgram, attendanceDate]);

  useEffect(() => {
    fetchLogs();
    if (role === "admin" || role === "superadmin" || role === "instructor") {
      fetchProgramsAndStudents();
    }
  }, [fetchLogs, fetchProgramsAndStudents, role]);

  useEffect(() => {
    if (activeTab === "student") {
      fetchStudentAttendanceRecords();
    }
  }, [activeTab, fetchStudentAttendanceRecords]);

  const today = new Date().toISOString().split("T")[0];
  const myTodayLog = logs.find((log: any) => log.email === user?.email && log.date === today);
  const activeSession = myTodayLog?.sessions?.find((s: any) => !s.clockOut);

  const handleClockToggle = async () => {
    if (!user?.email) return;
    setClocking(true);
    
    try {
      const isClockingOut = !!activeSession;
      const timestamp = new Date().toISOString();

      const payload = {
        action: isClockingOut ? "clockOut" : "clockIn",
        email: user.email,
        name: user.displayName || user.email,
        timestamp,
        note: clockNote,
        docId: myTodayLog?.docId,
      };

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process clock action");
      
      showToast(isClockingOut ? "Clocked out successfully!" : "Clocked in successfully!");
      setClockNote("");
      await fetchLogs();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to clock in/out. Please try again.", "error");
    } finally {
      setClocking(false);
    }
  };

  const openEditModal = (log: any) => {
    setEditingLog(log);
    setEditSessions(JSON.parse(JSON.stringify(log.sessions || [])));
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "override",
          docId: editingLog.docId,
          sessions: editSessions,
        }),
      });
      
      if (!res.ok) throw new Error("Failed to update record");
      
      showToast("Attendance record overridden successfully!");
      setIsEditModalOpen(false);
      fetchLogs();
    } catch (err: any) {
      console.error("Failed to override attendance", err);
      showToast(err.message || "Failed to update record", "error");
    }
  };

  const saveStudentAttendance = async (updatedRecords?: { [key: string]: "Present" | "Absent" }) => {
    try {
      const recordsToSave = updatedRecords || studentAttendance;
      const res = await fetch("/api/students/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          program: selectedProgram,
          date: attendanceDate,
          attendance: recordsToSave,
          markedBy: user?.email || "Staff"
        })
      });
      if (!res.ok) throw new Error("Failed to save student attendance");
      showToast("Student attendance synced successfully!");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to save attendance", "error");
    }
  };

  const handleStudentStatusChange = (studentId: string, status: "Present" | "Absent") => {
    const updated = {
      ...studentAttendance,
      [studentId]: status
    };
    setStudentAttendance(updated);
    saveStudentAttendance(updated); // Sync real-time!
  };

  const markAllStudents = (status: "Present" | "Absent") => {
    const updated: { [key: string]: "Present" | "Absent" } = {};
    const filteredStudents = students.filter(s => s.program === selectedProgram);
    filteredStudents.forEach(s => {
      updated[s.docId] = status;
    });
    setStudentAttendance(updated);
    saveStudentAttendance(updated);
  };

  const toggleRow = (docId: string) => {
    setExpandedRows(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const canEdit = isAdmin || role === "accountant" || role === "superadmin";
  const hasInstructorAccess = isAdmin || role === "superadmin" || role === "instructor";

  const filteredLogs = logs.filter((log: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.name && log.name.toLowerCase().includes(q)) ||
      (log.email && log.email.toLowerCase().includes(q)) ||
      (log.date && log.date.includes(q))
    );
  });

  const filteredStudents = students.filter((s: any) => s.program === selectedProgram);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white p-8 animate-fade-in">
      {/* ── Top Right Toaster ─────────────────────────────────── */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 rounded-xl bg-zinc-900 px-5 py-3.5 text-xs font-semibold text-white shadow-2xl flex items-center gap-2.5 animate-slide-in-right border border-zinc-800">
          {toast.type === "success" ? (
            <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4.5 w-4.5 text-rose-400" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Attendance</h1>
          <p className="mt-1 text-sm text-zinc-400">Track and view working hours, nested logs, and student rosters.</p>
        </div>

        {hasInstructorAccess && (
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800/60 shadow-lg">
            <button
              onClick={() => setActiveTab("staff")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "staff" ? "bg-emerald-500 text-zinc-950" : "text-zinc-400 hover:text-white"
              }`}
            >
              <User size={14} />
              Staff & Self
            </button>
            <button
              onClick={() => setActiveTab("student")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "student" ? "bg-emerald-500 text-zinc-950" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Users size={14} />
              Student Roster
            </button>
          </div>
        )}
      </div>

      {activeTab === "staff" ? (
        <>
          {/* ── Clock In/Out Widget ───────────────────────────── */}
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-md p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4 z-10 w-full md:w-auto">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${activeSession ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800/80 text-zinc-400'}`}>
                <Clock className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {activeSession ? "Currently Clocked In" : "Currently Clocked Out"}
                  {activeSession && (
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  )}
                </h2>
                <p className="text-sm text-zinc-400 mt-0.5">
                  {activeSession 
                    ? `Active Session started at ${formatTime(activeSession.clockIn)}`
                    : "You are not currently tracking time."}
                </p>
              </div>
            </div>
            
            {/* Clock notes field & Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto z-10">
              <div className="relative flex-1 sm:w-64">
                <Notebook size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Add clock notes (optional)..."
                  value={clockNote}
                  onChange={(e) => setClockNote(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <button
                onClick={handleClockToggle}
                disabled={clocking}
                className={`flex items-center justify-center gap-2 rounded-xl px-8 py-2.5 text-xs font-bold shadow-lg transition-all hover:shadow-xl disabled:opacity-70 ${
                  activeSession 
                    ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/20 hover:shadow-rose-500/30"
                    : "bg-gradient-to-r from-[#18cb96] to-[#059669] text-white shadow-[#18cb96]/20 hover:shadow-[#18cb96]/30"
                }`}
              >
                {clocking ? <Loader2 className="h-4 w-4 animate-spin" /> : (activeSession ? "Clock Out" : "Clock In")}
              </button>
            </div>
          </div>

          {/* ── Search & Logs ─────────────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md">
            <div className="border-b border-zinc-800/60 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-zinc-400" />
                <h3 className="font-bold text-white">Attendance Logs</h3>
              </div>

              {canEdit && (
                <div className="relative w-full sm:w-72">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search logs by staff or date..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-950/70 border border-zinc-800 rounded-xl pl-8.5 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              )}
            </div>
            
            {loading ? (
              <div className="p-16 flex justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-950 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-4 w-10"></th>
                      <th className="p-4">Date</th>
                      {canEdit && <th className="p-4">Staff Member</th>}
                      <th className="p-4">Sessions Count</th>
                      <th className="p-4">Last Event</th>
                      <th className="p-4">Total Hours</th>
                      <th className="p-4">Status</th>
                      {canEdit && <th className="p-4 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-sm">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={canEdit ? 8 : 6} className="p-12 text-center text-zinc-500">No attendance logs found.</td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => {
                        const sessions = log.sessions || [];
                        const isExpanded = expandedRows.includes(log.docId);
                        const firstSession = sessions[0];
                        const lastSession = sessions[sessions.length - 1];

                        return (
                          <Fragment key={log.docId}>
                            <tr className="hover:bg-zinc-800/20 transition-colors cursor-pointer group" onClick={() => toggleRow(log.docId)}>
                              <td className="p-4 text-zinc-500 text-center">
                                {isExpanded ? <ChevronUp size={16} className="group-hover:text-white" /> : <ChevronDown size={16} className="group-hover:text-white" />}
                              </td>
                              <td className="p-4 font-medium">{formatDate(log.date || log.clockIn)}</td>
                              {canEdit && (
                                <td className="p-4">
                                  <div className="text-emerald-400 font-semibold">{log.name || "Unknown"}</div>
                                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{log.email}</div>
                                </td>
                              )}
                              <td className="p-4 text-zinc-300 font-medium">
                                <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-lg text-xs">{sessions.length} sessions</span>
                              </td>
                              <td className="p-4 text-xs text-zinc-400">
                                {firstSession ? (
                                  <div>
                                    Clock In: <span className="font-semibold text-zinc-200">{formatTime(firstSession.clockIn)}</span>
                                    {lastSession?.clockOut && (
                                      <span> &bull; Clock Out: <span className="font-semibold text-zinc-200">{formatTime(lastSession.clockOut)}</span></span>
                                    )}
                                  </div>
                                ) : (
                                  "--"
                                )}
                              </td>
                              <td className="p-4 font-mono font-bold text-zinc-200">{log.totalHours || 0} hrs</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  log.status === "Working" ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                  {log.status || "Completed"}
                                </span>
                              </td>
                              {canEdit && (
                                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => openEditModal(log)} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-2 rounded-xl text-zinc-400 hover:text-white transition-colors">
                                    <Edit2 size={13} />
                                  </button>
                                </td>
                              )}
                            </tr>

                            {/* Nested collapsible sessions list */}
                            {isExpanded && (
                              <tr className="bg-zinc-950/40">
                                <td colSpan={canEdit ? 8 : 6} className="p-4 border-t border-zinc-800/40">
                                  <div className="pl-8 pr-4 py-2 space-y-3">
                                    <h4 className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
                                      <Clock size={11} />
                                      Detailed Daily Sessions Breakdown ({sessions.length})
                                    </h4>
                                    <div className="overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/30">
                                      <table className="w-full text-left text-xs">
                                        <thead className="bg-zinc-950 text-zinc-400 font-semibold uppercase">
                                          <tr>
                                            <th className="p-3">Session</th>
                                            <th className="p-3">Clock In</th>
                                            <th className="p-3">Clock In Note</th>
                                            <th className="p-3">Clock Out</th>
                                            <th className="p-3">Clock Out Note</th>
                                            <th className="p-3">Session Total</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-800/40">
                                          {sessions.map((sess: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-zinc-800/30">
                                              <td className="p-3 font-bold text-emerald-400">Session #{idx + 1}</td>
                                              <td className="p-3 font-semibold text-zinc-200">{formatTime(sess.clockIn)}</td>
                                              <td className="p-3 text-zinc-400 italic max-w-[200px] truncate" title={sess.clockInNote}>{sess.clockInNote || "--"}</td>
                                              <td className="p-3 font-semibold text-zinc-200">{formatTime(sess.clockOut)}</td>
                                              <td className="p-3 text-zinc-400 italic max-w-[200px] truncate" title={sess.clockOutNote}>{sess.clockOutNote || "--"}</td>
                                              <td className="p-3 font-mono font-bold text-emerald-400">{sess.hours ? sess.hours.toFixed(2) : "0.00"} hrs</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ── Student Attendance Tab ────────────────────────── */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900/40 border border-zinc-800/60 p-5 rounded-2xl backdrop-blur-md">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Select Course Program</label>
              <div className="relative">
                <BookOpen size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none"
                >
                  {programs.map((p) => (
                    <option key={p.docId} value={p.name}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Roster Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-end justify-start md:justify-end gap-3.5">
              <button
                type="button"
                onClick={() => markAllStudents("Present")}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => markAllStudents("Absent")}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
              >
                Mark All Absent
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md">
            <div className="border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-zinc-400" />
                <h3 className="font-bold text-white">Student Roster ({filteredStudents.length})</h3>
              </div>
            </div>

            {loadingStudents ? (
              <div className="p-16 flex justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-zinc-950 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Student Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Status Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-sm">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-12 text-center text-zinc-500">No students enrolled in this program.</td>
                      </tr>
                    ) : (
                      filteredStudents.map((stud) => {
                        const status = studentAttendance[stud.docId] || "Absent";
                        return (
                          <tr key={stud.docId} className="hover:bg-zinc-800/10 transition-colors">
                            <td className="p-4 font-bold text-white">{stud.name}</td>
                            <td className="p-4 font-mono text-xs text-zinc-400">{stud.email}</td>
                            <td className="p-4 flex items-center gap-3">
                              <button
                                onClick={() => handleStudentStatusChange(stud.docId, "Present")}
                                className={`text-[10px] font-bold uppercase px-4 py-1.5 rounded-lg border transition-all ${
                                  status === "Present" 
                                    ? "bg-emerald-500 text-zinc-950 border-emerald-500 shadow-lg shadow-emerald-500/20"
                                    : "bg-transparent text-zinc-500 border-zinc-800 hover:text-white"
                                }`}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => handleStudentStatusChange(stud.docId, "Absent")}
                                className={`text-[10px] font-bold uppercase px-4 py-1.5 rounded-lg border transition-all ${
                                  status === "Absent"
                                    ? "bg-rose-500 text-zinc-950 border-rose-500 shadow-lg shadow-rose-500/20"
                                    : "bg-transparent text-zinc-500 border-zinc-800 hover:text-white"
                                }`}
                              >
                                Absent
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal (Admin Oversight Panel) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <div>
                <h2 className="text-xl font-bold">Override Attendance</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Editing record for {editingLog.name || editingLog.email}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors font-bold text-lg">&times;</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Nested Daily Sessions</h3>

                {editSessions.map((sess, idx) => (
                  <div key={idx} className="p-4 border border-zinc-800/80 rounded-2xl bg-zinc-950/60 space-y-3.5 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">Session #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditSessions(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Clock In Timestamp</label>
                        <input
                          type="text"
                          required
                          value={sess.clockIn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditSessions(prev => prev.map((s, i) => i === idx ? { ...s, clockIn: val } : s));
                          }}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Clock Out Timestamp</label>
                        <input
                          type="text"
                          value={sess.clockOut || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditSessions(prev => prev.map((s, i) => i === idx ? { ...s, clockOut: val || null } : s));
                          }}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Clock In Note</label>
                        <input
                          type="text"
                          value={sess.clockInNote || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditSessions(prev => prev.map((s, i) => i === idx ? { ...s, clockInNote: val } : s));
                          }}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Clock Out Note</label>
                        <input
                          type="text"
                          value={sess.clockOutNote || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditSessions(prev => prev.map((s, i) => i === idx ? { ...s, clockOutNote: val } : s));
                          }}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Calculated Hours</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={sess.hours || 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEditSessions(prev => prev.map((s, i) => i === idx ? { ...s, hours: val } : s));
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setEditSessions(prev => [
                      ...prev,
                      {
                        clockIn: new Date().toISOString(),
                        clockOut: null,
                        clockInNote: "Admin Added Session",
                        clockOutNote: "",
                        hours: 0
                      }
                    ]);
                  }}
                  className="w-full border border-dashed border-zinc-800 hover:border-emerald-500/50 py-3 rounded-2xl text-xs text-zinc-400 hover:text-emerald-400 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus size={14} />
                  Add Custom Session
                </button>
              </div>

              <div className="border-t border-zinc-800 pt-4 flex gap-3 z-20">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl transition-all text-xs font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-emerald-400 to-emerald-600 text-zinc-950 py-2.5 rounded-xl transition-all text-xs font-bold shadow-lg shadow-emerald-500/20">Override Records</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

