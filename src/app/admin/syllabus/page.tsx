"use client";

import { useEffect, useState } from "react";
import { BookOpen, Plus, Edit2, Trash2, Send, CheckCircle, XCircle } from "lucide-react";
import { useAdmin } from "@/components/AdminContext";

export default function SyllabusPage() {
  const { user, role, isAdmin } = useAdmin();
  const [syllabusList, setSyllabusList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [description, setDescription] = useState("");
  const [weeksInput, setWeeksInput] = useState(""); // newline separated list of topics
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    if (user?.email) {
      fetchSyllabus();
      fetchPrograms();
    }
  }, [user?.email, role]);

  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/syllabus?email=${encodeURIComponent(user?.email || "")}&role=${role}`);
      const data = await res.json();
      setSyllabusList(data.syllabus || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/programs");
      const data = await res.json();
      setPrograms(data.programs || []);
      if (data.programs?.length > 0) {
        setCourse(data.programs[0].name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTitle("");
    if (programs.length > 0) setCourse(programs[0].name);
    setDescription("");
    setWeeksInput("");
    setEditingItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setTitle(item.title);
    setCourse(item.course);
    setDescription(item.description || "");
    setWeeksInput(item.weeks ? item.weeks.join("\n") : "");
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weeks = weeksInput.split("\n").filter((w) => w.trim() !== "");
    
    try {
      const payload: any = { title, course, description, weeks };
      
      if (editingItem) {
        await fetch(`/api/syllabus/${editingItem.docId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        payload.staffEmail = user?.email;
        payload.staffName = user?.displayName || user?.email;
        await fetch("/api/syllabus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setIsModalOpen(false);
      resetForm();
      fetchSyllabus();
    } catch (err) {
      console.error(err);
      alert("Failed to save syllabus");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this syllabus?")) return;
    try {
      await fetch(`/api/syllabus/${id}`, { method: "DELETE" });
      fetchSyllabus();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/syllabus/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchSyllabus();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft": return <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400">Draft</span>;
      case "Pending Approval": return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400">Pending</span>;
      case "Approved": return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400">Approved</span>;
      case "Rejected": return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400">Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Syllabus Management</h1>
          <p className="text-zinc-400">Draft, submit, and approve course syllabi.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-lg shadow-emerald-500/20"
        >
          <Plus size={20} />
          Create Syllabus
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {syllabusList.map((item) => (
            <div key={item.docId} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col h-full hover:border-zinc-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                {getStatusBadge(item.status)}
                {isAdmin && <span className="text-xs text-zinc-500">By: {item.staffName}</span>}
              </div>
              <h3 className="text-xl font-bold mb-1">{item.title}</h3>
              <p className="text-emerald-400 text-sm font-medium mb-4">{item.course}</p>
              <p className="text-zinc-400 text-sm mb-6 line-clamp-3 flex-1">{item.description}</p>

              <div className="border-t border-zinc-800 pt-4 flex gap-2 mt-auto flex-wrap">
                {(item.status === "Draft" || item.status === "Rejected") && (
                  <button
                    onClick={() => updateStatus(item.docId, "Pending Approval")}
                    className="flex-1 min-w-[100px] bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                  >
                    <Send size={16} /> Submit
                  </button>
                )}
                
                {isAdmin && item.status === "Pending Approval" && (
                  <>
                    <button
                      onClick={() => updateStatus(item.docId, "Approved")}
                      className="flex-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button
                      onClick={() => updateStatus(item.docId, "Rejected")}
                      className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </>
                )}

                <button
                  onClick={() => openEditModal(item)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 px-3 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.docId)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 px-3 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="text-emerald-500" />
                {editingItem ? "Edit Syllabus" : "Create Syllabus"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Syllabus Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    placeholder="e.g. Fullstack React Course - Cohort A"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Target Program/Course</label>
                  <select
                    required
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {programs.map((p) => (
                      <option key={p.docId} value={p.name}>{p.name}</option>
                    ))}
                    {programs.length === 0 && <option value="">No programs available</option>}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Description / Overview</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors min-h-[100px]"
                    placeholder="Brief overview of the syllabus..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Topics by Week (1 per line)</label>
                  <textarea
                    value={weeksInput}
                    onChange={(e) => setWeeksInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors min-h-[150px] font-mono text-sm leading-relaxed"
                    placeholder="Week 1: Introduction to HTML & CSS&#10;Week 2: JavaScript Fundamentals&#10;Week 3: React Basics"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl transition-colors font-medium shadow-lg shadow-emerald-500/20"
                >
                  Save Syllabus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
