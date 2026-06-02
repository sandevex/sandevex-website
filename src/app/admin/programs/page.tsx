"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react";
import { useAdmin } from "@/components/AdminContext";

export default function ProgramsPage() {
  const { isAdmin, role, allowDelete } = useAdmin();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Active");
  const [badge, setBadge] = useState("");
  const [skillsInput, setSkillsInput] = useState("");

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/programs");
      const data = await res.json();
      setPrograms(data.programs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setDuration("");
    setPrice("");
    setStatus("Active");
    setBadge("");
    setSkillsInput("");
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (prog: any) => {
    setName(prog.name);
    setDescription(prog.description || "");
    setDuration(prog.duration);
    setPrice(prog.price.toString());
    setStatus(prog.status);
    setBadge(prog.badge || "");
    setSkillsInput(prog.skills ? prog.skills.join("\n") : "");
    setEditingId(prog.docId);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s !== "");

    const payload = { 
      name, 
      description, 
      duration, 
      price: Number(price), 
      status,
      badge,
      skills
    };

    try {
      if (editingId) {
        await fetch(`/api/programs/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/programs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      resetForm();
      fetchPrograms();
    } catch (err) {
      console.error(err);
      alert("Failed to save program.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this program?")) return;
    try {
      await fetch(`/api/programs/${id}`, { method: "DELETE" });
      fetchPrograms();
    } catch (err) {
      console.error(err);
    }
  };

  const isAuthorized = isAdmin || role === "instructor";
  if (!isAuthorized) {
    return <div className="p-8 text-white">Access Denied. Admins and Instructors only.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Program Management</h1>
          <p className="text-zinc-400">Manage courses, durations, and internal pricing.</p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Program
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <div key={prog.docId} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-zinc-800 rounded-xl text-emerald-400">
                  <BookOpen size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  prog.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {prog.status}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{prog.name}</h3>
              <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{prog.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Duration:</span>
                  <span className="font-medium">{prog.duration}</span>
                </div>
                {isAdmin && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Price (Hidden):</span>
                    <span className="font-medium text-emerald-400">₹{prog.price}</span>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="flex gap-2 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => openEditModal(prog)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  {allowDelete && (
                    <button
                      onClick={() => handleDelete(prog.docId)}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingId ? "Edit Program" : "Add Program"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Program Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Duration (e.g. 12 Weeks)</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Price (₹) - Admin Only</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Badge (e.g. Most Popular, Creative Hub)</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. Creative Hub"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Skills & Architecture (1 per line)</label>
                <textarea
                  rows={3}
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g.&#10;Next.js & React Server Components&#10;Postgres, Prisma & Database Tuning"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl transition-colors font-medium"
                >
                  {editingId ? "Save Changes" : "Create Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
