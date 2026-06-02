"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdmin } from "@/components/AdminContext";
import {
  Star,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  AlertCircle,
  Search,
} from "lucide-react";

interface Testimonial {
  docId: string;
  quote: string;
  author: string;
  role: string;
  course: string;
  stars: number;
  approved: boolean;
  createdAt: string;
}

export default function AdminTestimonialsPage() {
  const { allowDelete } = useAdmin();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending">("all");
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    author: "",
    role: "",
    course: "Fullstack Web Engineering",
    quote: "",
    stars: 5,
    approved: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/testimonials?all=true");
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    } catch {
      showToast("Failed to load testimonials", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleToggleApproval = async (t: Testimonial) => {
    try {
      const res = await fetch(`/api/testimonials/${t.docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !t.approved }),
      });
      if (res.ok) {
        setTestimonials((prev) =>
          prev.map((item) =>
            item.docId === t.docId ? { ...item, approved: !item.approved } : item
          )
        );
        showToast(t.approved ? "Testimonial unapproved" : "Testimonial approved");
      }
    } catch {
      showToast("Failed to update", "error");
    }
  };

  const handleDelete = async (docId: string) => {
    setDeletingId(docId);
    try {
      const res = await fetch(`/api/testimonials/${docId}`, { method: "DELETE" });
      if (res.ok) {
        setTestimonials((prev) => prev.filter((t) => t.docId !== docId));
        showToast("Testimonial deleted");
      }
    } catch {
      showToast("Failed to delete", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ author: "", role: "", course: "Fullstack Web Engineering", quote: "", stars: 5, approved: true });
    setShowModal(true);
  };

  const openEditModal = (t: Testimonial) => {
    setEditingId(t.docId);
    setFormData({
      author: t.author,
      role: t.role,
      course: t.course,
      quote: t.quote,
      stars: t.stars,
      approved: t.approved,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.author || !formData.role || !formData.quote) {
      showToast("Fill in all required fields", "error");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        // Update
        const res = await fetch(`/api/testimonials/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setTestimonials((prev) =>
            prev.map((t) => (t.docId === editingId ? { ...t, ...formData } : t))
          );
          showToast("Testimonial updated");
        }
      } else {
        // Create
        const res = await fetch("/api/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          await fetchTestimonials();
          showToast("Testimonial created");
        }
      }
      setShowModal(false);
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = testimonials.filter((t) => {
    const matchesSearch =
      t.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.quote.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "approved" && t.approved) ||
      (filterStatus === "pending" && !t.approved);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#18cb96]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-50 rounded-xl px-5 py-3 text-xs font-semibold text-white shadow-2xl flex items-center gap-2 animate-scale-in ${
          toastType === "success" ? "bg-emerald-600" : "bg-red-600"
        }`}>
          {toastType === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toastMsg}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingId ? "Edit Testimonial" : "Add Testimonial"}
              </h3>
              <button onClick={() => setShowModal(false)} className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-400">Author Name *</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData((p) => ({ ...p, author: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 px-3 text-sm text-white focus:border-[#18cb96] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-400">Current Role *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 px-3 text-sm text-white focus:border-[#18cb96] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-400">Course</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData((p) => ({ ...p, course: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 px-3 text-sm text-white focus:border-[#18cb96] focus:outline-none"
                  >
                    <option>Fullstack Web Engineering</option>
                    <option>Frontend Engineering & Systems</option>
                    <option>UI/UX & Product Design</option>
                    <option>Systems & Database Architecture</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-400">Rating</label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, stars: s }))}
                      >
                        <Star className={`h-5 w-5 transition ${s <= formData.stars ? "text-amber-500 fill-current" : "text-zinc-600"}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-400">Quote *</label>
                <textarea
                  value={formData.quote}
                  onChange={(e) => setFormData((p) => ({ ...p, quote: e.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 px-3 text-sm text-white focus:border-[#18cb96] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-zinc-400">Pre-approved:</label>
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, approved: !p.approved }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.approved ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${formData.approved ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-zinc-700 px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-xl bg-gradient-to-r from-[#18cb96] to-[#059669] px-5 py-2.5 text-xs font-semibold text-white shadow-lg hover:shadow-xl transition disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Testimonials</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage and curate graduate success stories
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18cb96] to-[#059669] px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition"
        >
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by author, course, or quote..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-[#18cb96] focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "approved", "pending"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                filterStatus === status
                  ? "bg-[#18cb96]/15 text-[#18cb96] border border-[#18cb96]/20"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Testimonials Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Star className="h-12 w-12 text-zinc-700 mb-4" />
          <p className="text-sm text-zinc-500">No testimonials found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((t) => (
            <div
              key={t.docId}
              className="rounded-2xl border border-zinc-800/60 bg-zinc-900/80 p-5 transition hover:border-zinc-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#18cb96] to-[#059669] text-white text-xs font-bold">
                    {t.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{t.author}</h4>
                    <p className="text-[11px] text-zinc-500">{t.role}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                  t.approved
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                }`}>
                  {t.approved ? "Approved" : "Pending"}
                </span>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < t.stars ? "text-amber-500 fill-current" : "text-zinc-700"}`} />
                ))}
              </div>

              {/* Quote */}
              <p className="text-xs leading-5 text-zinc-400 italic line-clamp-3 mb-3">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Course & Date */}
              <p className="text-[10px] font-semibold text-[#18cb96] mb-4">{t.course}</p>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
                <button
                  onClick={() => handleToggleApproval(t)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                    t.approved
                      ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  {t.approved ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                  {t.approved ? "Unapprove" : "Approve"}
                </button>
                <button
                  onClick={() => openEditModal(t)}
                  className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-[11px] font-semibold text-zinc-400 hover:bg-zinc-700 transition"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </button>
                {allowDelete && (
                  <button
                    onClick={() => handleDelete(t.docId)}
                    disabled={deletingId === t.docId}
                    className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-red-400 hover:bg-red-500/10 transition disabled:opacity-50 cursor-pointer"
                  >
                    {deletingId === t.docId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
