"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Layers, Users, BookOpen, Mail, UserCheck } from "lucide-react";
import { useAdmin } from "@/components/AdminContext";

export default function BatchesPage() {
  const { user, role, isAdmin } = useAdmin();
  const [batches, setBatches] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [programName, setProgramName] = useState("");
  const [instructorEmail, setInstructorEmail] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Toast Notification
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (user?.email) {
      fetchData();
    }
  }, [user?.email, role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [batchesRes, programsRes, usersRes, studentsRes] = await Promise.all([
        fetch(`/api/batches?email=${encodeURIComponent(user?.email || "")}&role=${role}`),
        fetch("/api/programs"),
        fetch("/api/users"),
        fetch(`/api/students?email=${encodeURIComponent(user?.email || "")}&role=${role}`),
      ]);

      const batchesData = await batchesRes.json();
      const programsData = await programsRes.json();
      const usersData = await usersRes.json();
      const studentsData = await studentsRes.json();

      setBatches(batchesData.batches || []);
      setPrograms(programsData.programs || []);
      
      // Filter out users who are instructors
      const filteredInstructors = (usersData.users || []).filter(
        (u: any) => u.role === "instructor" || u.role === "superadmin" || u.role === "admin"
      );
      setInstructors(filteredInstructors);
      setStudents(studentsData.students || []);

      if (programsData.programs?.length > 0) {
        setProgramName(programsData.programs[0].name);
      }
      if (filteredInstructors.length > 0) {
        setInstructorEmail(filteredInstructors[0].email);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch database rosters", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    if (programs.length > 0) setProgramName(programs[0].name);
    if (instructors.length > 0) setInstructorEmail(instructors[0].email);
    setSelectedStudents([]);
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (batch: any) => {
    setName(batch.name);
    setProgramName(batch.programName);
    setInstructorEmail(batch.instructorEmail);
    setSelectedStudents(batch.studentEmails || []);
    setEditingId(batch.docId);
    setIsModalOpen(true);
  };

  const toggleStudent = (email: string) => {
    setSelectedStudents((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      programName,
      instructorEmail,
      studentEmails: selectedStudents,
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/batches/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
        showToast("Batch cohort updated successfully!");
      } else {
        const res = await fetch("/api/batches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Creation failed");
        showToast("Batch cohort created successfully!");
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to save batch", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this batch?")) return;
    try {
      const res = await fetch(`/api/batches/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Deletion failed");
      showToast("Batch removed successfully!");
      fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete batch", "error");
    }
  };

  const isAuthorized = isAdmin || role === "instructor";
  if (!isAuthorized) {
    return <div className="p-8 text-white">Access Denied. Admins and Instructors only.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-white relative">
      {/* Dynamic Toast popup */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 rounded-xl bg-zinc-900 border border-zinc-800 px-5 py-3 text-xs font-bold shadow-2xl flex items-center gap-2 animate-slide-in-right">
          <div className={`h-2 w-2 rounded-full ${toast.type === "success" ? "bg-emerald-400" : "bg-red-400"}`} />
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cohort Batches</h1>
          <p className="text-zinc-400 text-sm">Assign instructors and map active student groups to courses.</p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold shadow-lg shadow-emerald-500/20 text-xs cursor-pointer"
          >
            <Plus size={16} />
            Create Batch
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.length === 0 ? (
            <div className="col-span-full border border-dashed border-zinc-800 rounded-3xl p-16 text-center text-zinc-500">
              <Layers className="mx-auto mb-4 h-12 w-12 text-zinc-700" />
              No batches created yet. {isAdmin && "Click 'Create Batch' to set up your first cohort!"}
            </div>
          ) : (
            batches.map((batch) => (
              <div key={batch.docId} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-emerald-400">
                      <Layers size={22} />
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {batch.studentEmails?.length || 0} Students
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1.5 text-white">{batch.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold mb-4">
                    <BookOpen size={13} className="text-[#18cb96]" />
                    <span>{batch.programName}</span>
                  </div>

                  <div className="bg-zinc-950/60 rounded-2xl p-4 border border-zinc-850 space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <UserCheck size={14} className="text-zinc-500" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-650 tracking-widest leading-none">Instructor</p>
                        <p className="text-xs font-semibold text-zinc-300 mt-1">{batch.instructorEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex gap-2.5 pt-4 border-t border-zinc-850/80 mt-auto">
                    <button
                      onClick={() => openEditModal(batch)}
                      className="flex-1 bg-zinc-850 hover:bg-zinc-800 text-white py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs font-bold cursor-pointer"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(batch.docId)}
                      className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-450 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors text-xs font-bold cursor-pointer"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-850 flex justify-between items-center bg-zinc-950">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Layers className="text-emerald-500" />
                {editingId ? "Edit Cohort Batch" : "Create Cohort Batch"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white font-bold text-lg">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fullstack Cohort 2026-A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Select Program *</label>
                  <select
                    required
                    value={programName}
                    onChange={(e) => setProgramName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {programs.map((p) => (
                      <option key={p.docId} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Assign Instructor *</label>
                  <select
                    required
                    value={instructorEmail}
                    onChange={(e) => setInstructorEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {instructors.map((i) => (
                      <option key={i.docId} value={i.email}>{i.name || i.email} ({i.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Map Enrolled Students</label>
                <p className="text-zinc-550 text-[10px] mb-2 font-medium">Select the student emails to include in this batch cohort.</p>
                
                <div className="border border-zinc-850 rounded-2xl bg-zinc-950 overflow-hidden max-h-48 overflow-y-auto p-3.5 space-y-2.5 custom-scrollbar">
                  {students.length === 0 ? (
                    <p className="text-xs text-zinc-600 text-center py-6">No students registered in the roster yet.</p>
                  ) : (
                    students.map((student) => {
                      const isSelected = selectedStudents.includes(student.email);
                      return (
                        <div
                          key={student.docId}
                          onClick={() => toggleStudent(student.email)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-emerald-500/30 bg-emerald-500/5 text-white"
                              : "border-zinc-850 hover:bg-zinc-900 text-zinc-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Mail size={13} className={isSelected ? "text-emerald-400" : "text-zinc-650"} />
                            <div className="text-left">
                              <p className="text-xs font-bold">{student.name}</p>
                              <p className="text-[10px] font-mono text-zinc-555 leading-none mt-0.5">{student.email}</p>
                            </div>
                          </div>
                          <div className={`h-4 w-4 rounded flex items-center justify-center border transition-all ${
                            isSelected ? "bg-emerald-500 border-emerald-500 text-zinc-950 font-black" : "border-zinc-700"
                          }`}>
                            {isSelected && "✓"}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl transition-colors font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 py-2.5 rounded-xl transition-all font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {editingId ? "Save Changes" : "Assemble Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
