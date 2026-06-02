"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MessageSquare,
  Search,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  Phone,
  FileText,
  Filter,
} from "lucide-react";
import { useAdmin } from "@/components/AdminContext";

/* ─── Types ────────────────────────────────────────────────────── */
interface Inquiry {
  docId: string;
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  ticketId: string;
  status: string;
  notes: string;
  createdAt: string;
}

const STATUS_OPTIONS = ["Open", "In Progress", "Resolved"];

/* ─── Toast ────────────────────────────────────────────────────── */
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed top-6 right-6 z-50 animate-fade-in-up">
      <div
        className={`flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-2xl backdrop-blur-xl ${
          type === "success"
            ? "border-emerald-500/20 bg-emerald-950/90 text-emerald-300"
            : "border-red-500/20 bg-red-950/90 text-red-300"
        }`}
      >
        {type === "success" ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <AlertCircle className="h-5 w-5" />
        )}
        <p className="text-sm font-medium">{message}</p>
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Status Badge ─────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Open: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    "In Progress": "bg-amber-500/15 text-amber-400 border-amber-500/20",
    Resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${colors[status] || "bg-zinc-700/50 text-zinc-400 border-zinc-600/30"}`}
    >
      {status}
    </span>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function InquiriesPage() {
  const { allowDelete } = useAdmin();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filtered, setFiltered] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Inline edit
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  // Delete
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inquiries");
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch {
      setToast({ message: "Failed to load inquiries", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Filter + search
  useEffect(() => {
    let result = inquiries;
    if (statusFilter !== "All") {
      result = result.filter((i) => i.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.ticketId.toLowerCase().includes(q) ||
          i.inquiryType.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [inquiries, search, statusFilter]);

  const updateStatus = async (docId: string, newStatus: string) => {
    setSaving(docId);
    try {
      const res = await fetch(`/api/inquiries/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
      setInquiries((prev) =>
        prev.map((i) => (i.docId === docId ? { ...i, status: newStatus } : i))
      );
      setToast({ message: "Status updated", type: "success" });
    } catch {
      setToast({ message: "Failed to update status", type: "error" });
    } finally {
      setSaving(null);
    }
  };

  const saveNotes = async (docId: string) => {
    const notes = editingNotes[docId];
    if (notes === undefined) return;
    setSaving(docId);
    try {
      const res = await fetch(`/api/inquiries/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error("Update failed");
      setInquiries((prev) =>
        prev.map((i) => (i.docId === docId ? { ...i, notes } : i))
      );
      setEditingNotes((prev) => {
        const updated = { ...prev };
        delete updated[docId];
        return updated;
      });
      setToast({ message: "Notes saved", type: "success" });
    } catch {
      setToast({ message: "Failed to save notes", type: "error" });
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (docId: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/inquiries/${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setToast({ message: "Inquiry deleted", type: "success" });
      setDeleting(null);
      setExpanded(null);
      fetchInquiries();
    } catch {
      setToast({ message: "Failed to delete inquiry", type: "error" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  const toggleExpand = (docId: string) => {
    setExpanded((prev) => (prev === docId ? null : docId));
  };

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Inquiries
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {inquiries.length} total · {inquiries.filter((i) => i.status === "Open").length} open
        </p>
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name, email, ticket, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-800/60 bg-zinc-900/80 py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition-all focus:border-[#18cb96]/40 focus:ring-2 focus:ring-[#18cb96]/10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          {["All", ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                statusFilter === s
                  ? "bg-[#18cb96]/15 text-[#18cb96] border border-[#18cb96]/20"
                  : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300 border border-transparent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#18cb96]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-zinc-800/60 bg-zinc-900/50">
          <MessageSquare className="mb-3 h-12 w-12 text-zinc-700" />
          <p className="text-sm text-zinc-500">No inquiries found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inq) => {
            const isExpanded = expanded === inq.docId;
            return (
              <div
                key={inq.docId}
                className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/80 transition-all"
              >
                {/* Row */}
                <button
                  onClick={() => toggleExpand(inq.docId)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-zinc-800/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80">
                    <MessageSquare className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-200">
                        {inq.name}
                      </p>
                      <span className="rounded-md bg-zinc-800/60 px-2 py-0.5 font-mono text-[10px] font-medium text-zinc-500">
                        {inq.ticketId}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {inq.inquiryType} · {inq.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={inq.status} />
                    <span className="hidden text-xs text-zinc-600 sm:block">
                      {formatDate(inq.createdAt)}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-500" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-zinc-800/40 bg-zinc-950/40 px-5 py-5">
                    <div className="grid gap-5 lg:grid-cols-2">
                      {/* Contact Info */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Contact Info
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Mail className="h-3.5 w-3.5 text-zinc-500" />
                            {inq.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Phone className="h-3.5 w-3.5 text-zinc-500" />
                            {inq.phone}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Clock className="h-3.5 w-3.5 text-zinc-500" />
                            {formatDate(inq.createdAt)}
                          </div>
                        </div>

                        <h4 className="pt-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Message
                        </h4>
                        <div className="rounded-xl bg-zinc-800/40 p-4">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                            {inq.message}
                          </p>
                        </div>
                      </div>

                      {/* Admin Actions */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Update Status
                        </h4>
                        <div className="flex gap-2">
                          {STATUS_OPTIONS.map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStatus(inq.docId, s)}
                              disabled={saving === inq.docId || inq.status === s}
                              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                                inq.status === s
                                  ? "bg-[#18cb96]/15 text-[#18cb96] border border-[#18cb96]/20"
                                  : "border border-zinc-700/40 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                              } disabled:opacity-50`}
                            >
                              {saving === inq.docId ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                s
                              )}
                            </button>
                          ))}
                        </div>

                        <h4 className="pt-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Admin Notes
                        </h4>
                        <textarea
                          rows={4}
                          value={
                            editingNotes[inq.docId] !== undefined
                              ? editingNotes[inq.docId]
                              : inq.notes || ""
                          }
                          onChange={(e) =>
                            setEditingNotes({
                              ...editingNotes,
                              [inq.docId]: e.target.value,
                            })
                          }
                          placeholder="Add notes about this inquiry..."
                          className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-[#18cb96]/50 focus:ring-2 focus:ring-[#18cb96]/20 resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => saveNotes(inq.docId)}
                            disabled={
                              saving === inq.docId ||
                              editingNotes[inq.docId] === undefined
                            }
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18cb96] to-[#059669] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#18cb96]/20 transition-all hover:shadow-xl disabled:opacity-50"
                          >
                            {saving === inq.docId && (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                            <FileText className="h-3 w-3" />
                            Save Notes
                          </button>
                          {allowDelete && (
                            <button
                              onClick={() => setDeleting(inq.docId)}
                              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete Confirmation ─────────────────────────────────── */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm animate-scale-in rounded-2xl border border-zinc-800/60 bg-zinc-900 p-6 shadow-2xl">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Inquiry</h3>
            <p className="mt-2 text-sm text-zinc-400">
              This action cannot be undone. The inquiry and all associated
              notes will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="rounded-xl border border-zinc-700/50 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleting)}
                disabled={deleteLoading}
                className="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-60"
              >
                {deleteLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
