"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useAdmin } from "@/components/AdminContext";
import {
  Award,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Filter,
  FileDown,
} from "lucide-react";
import { generateCertificatePdf } from "@/lib/certificatePdf";

/* ─── Types ────────────────────────────────────────────────────── */
interface Credential {
  docId: string;
  id: string;
  name: string;
  course: string;
  grade: string;
  issueDate: string;
  status: string;
  type: string;
  issuer?: string;
  createdAt?: string;
}

interface FormData {
  id: string;
  name: string;
  course: string;
  grade: string;
  issueDate: string;
  status: string;
  type: string;
}

const STATUSES = ["Active", "Revoked", "Suspended"];
const TYPES = [
  "Certified Professional",
  "Completion Certificate",
  "Internship Certificate",
  "Excellence Award",
];

const emptyForm: FormData = {
  id: "",
  name: "",
  course: "",
  grade: "",
  issueDate: "",
  status: "Active",
  type: TYPES[0],
};

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
    Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    Revoked: "bg-red-500/15 text-red-400 border-red-500/20",
    Suspended: "bg-amber-500/15 text-amber-400 border-amber-500/20",
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
export default function CredentialsPage() {
  const { allowDelete } = useAdmin();
  const [activeTab, setActiveTab] = useState<"credentials" | "designs">("credentials");
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [filtered, setFiltered] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [courses, setCourses] = useState<string[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Credential | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Design Templates State
  const [selectedDesignType, setSelectedDesignType] = useState(TYPES[0]);
  const [designForm, setDesignForm] = useState({
    title: "",
    subtitle1: "",
    subtitle2: "",
    signatoryName: "",
    signatoryTitle: "",
    signatorySub: "",
    sealS: "S",
    footerText: "",
  });
  const [loadingDesign, setLoadingDesign] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);

  // Toast
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const fetchCredentials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/credentials");
      const data = await res.json();
      setCredentials(data.credentials || []);
    } catch {
      setToast({ message: "Failed to load credentials", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/programs");
      const data = await res.json();
      if (data.programs) {
        const names = data.programs.map((p: any) => p.name);
        setCourses(names);
      }
    } catch (err) {
      console.error("Failed to load dynamic courses:", err);
    }
  }, []);

  const fetchDesignTemplate = useCallback(async (type: string) => {
    try {
      setLoadingDesign(true);
      const res = await fetch(`/api/certificate-designs?type=${encodeURIComponent(type)}`);
      const data = await res.json();
      if (data.design) {
        setDesignForm({
          title: data.design.title || "",
          subtitle1: data.design.subtitle1 || "",
          subtitle2: data.design.subtitle2 || "",
          signatoryName: data.design.signatoryName || "",
          signatoryTitle: data.design.signatoryTitle || "",
          signatorySub: data.design.signatorySub || "",
          sealS: data.design.sealS || "S",
          footerText: data.design.footerText || "",
        });
      } else {
        // Fallback default templates
        setDesignForm({
          title: "Certificate of Competency",
          subtitle1: "This document certifies that the following candidate has successfully completed all required training modules,",
          subtitle2: "coding assignments, and guided industry internships under real software development environment standards.",
          signatoryName: "N. Sandeep",
          signatoryTitle: "DIRECTOR, SANDEVEX LABS",
          signatorySub: "Sand-Hut Tech Solutions",
          sealS: "S",
          footerText: "POWERED BY SAND-HUT TECH SOLUTIONS  •  ISO 9001:2015 ACCREDITED",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDesign(false);
    }
  }, []);

  useEffect(() => {
    fetchCredentials();
    fetchCourses();
  }, [fetchCredentials, fetchCourses]);

  useEffect(() => {
    if (activeTab === "designs") {
      fetchDesignTemplate(selectedDesignType);
    }
  }, [activeTab, selectedDesignType, fetchDesignTemplate]);

  const handleSaveDesign = async (e: FormEvent) => {
    e.preventDefault();
    setSavingDesign(true);
    try {
      const res = await fetch("/api/certificate-designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedDesignType,
          ...designForm,
        }),
      });
      if (!res.ok) throw new Error("Failed to save template");
      setToast({ message: "Certificate template saved successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to save template design", type: "error", });
    } finally {
      setSavingDesign(false);
    }
  };

  const exportToCSV = () => {
    try {
      if (filtered.length === 0) {
        setToast({ message: "No records available to export", type: "error" });
        return;
      }

      const headers = ["Credential ID", "Graduate Name", "Course Program", "Grade Achieved", "Issue Date", "Status", "Certificate Type", "Issuer"];
      
      const rows = filtered.map(c => [
        `"${c.id}"`,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.course.replace(/"/g, '""')}"`,
        `"${(c.grade || "").replace(/"/g, '""')}"`,
        `"${c.issueDate}"`,
        `"${c.status}"`,
        `"${c.type}"`,
        `"${(c.issuer || "Sandevex Labs").replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Sandevex_Credentials_Export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToast({ message: "Credentials exported successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to export credentials", type: "error" });
    }
  };

  // Filter + search
  useEffect(() => {
    let result = credentials;
    if (statusFilter !== "All") {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (courseFilter !== "All") {
      result = result.filter((c) => c.course === courseFilter);
    }
    if (typeFilter !== "All") {
      result = result.filter((c) => c.type === typeFilter);
    }
    if (gradeFilter !== "All") {
      result = result.filter((c) => {
        if (!c.grade) return false;
        return c.grade.toLowerCase() === gradeFilter.toLowerCase();
      });
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.course.toLowerCase().includes(q) ||
          (c.grade && c.grade.toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [credentials, search, statusFilter, courseFilter, typeFilter, gradeFilter]);

  const openAdd = () => {
    const year = new Date().getFullYear();
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generatedId = `SE-${year}-${randomChars}`;

    setEditing(null);
    setForm({ 
      ...emptyForm, 
      id: generatedId, 
      course: courses.length > 0 ? courses[0] : "" 
    });
    setModalOpen(true);
  };

  const openEdit = (cred: Credential) => {
    setEditing(cred);
    setForm({
      id: cred.id,
      name: cred.name,
      course: cred.course,
      grade: cred.grade,
      issueDate: cred.issueDate,
      status: cred.status,
      type: cred.type,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editing) {
        const res = await fetch(`/api/credentials/${editing.docId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Update failed");
        }
        setToast({ message: "Credential updated successfully", type: "success" });
      } else {
        const res = await fetch("/api/credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Creation failed");
        }
        setToast({ message: "Credential created successfully", type: "success" });
      }
      setModalOpen(false);
      fetchCredentials();
    } catch (err: unknown) {
      setToast({
        message: err instanceof Error ? err.message : "Operation failed",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (docId: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/credentials/${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setToast({ message: "Credential deleted", type: "success" });
      setDeleting(null);
      fetchCredentials();
    } catch {
      setToast({ message: "Failed to delete credential", type: "error" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (cred: Credential) => {
    setDownloadingId(cred.id);
    setToast({ message: "Generating landscape PDF certificate...", type: "success" });
    try {
      await generateCertificatePdf({
        id: cred.id,
        name: cred.name,
        course: cred.course,
        grade: cred.grade,
        issueDate: cred.issueDate,
        status: cred.status,
        type: cred.type,
        issuer: cred.issuer || "Sandevex Labs in partnership with Sand-Hut Tech Solutions",
      });
      setToast({ message: "Certificate downloaded successfully!", type: "success" });
    } catch {
      setToast({ message: "Failed to generate PDF certificate", type: "error" });
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
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

      {/* ── Segmented Tab Selector ────────────────────────────── */}
      <div className="flex border-b border-zinc-800/80 mb-6 bg-zinc-950/20 p-1.5 rounded-xl gap-2 w-fit">
        <button
          onClick={() => setActiveTab("credentials")}
          className={`px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            activeTab === "credentials"
              ? "bg-[#18cb96] text-zinc-950 shadow-md shadow-[#18cb96]/20 font-black"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
          }`}
        >
          Ledger Registry
        </button>
        <button
          onClick={() => setActiveTab("designs")}
          className={`px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
            activeTab === "designs"
              ? "bg-[#18cb96] text-zinc-950 shadow-md shadow-[#18cb96]/20 font-black"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
          }`}
        >
          Design Templates
        </button>
      </div>

      {activeTab === "credentials" ? (
        <div className="space-y-6 animate-fade-in">
          {/* ── Header ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                Credentials Ledger
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {credentials.length} total registered secure credential{credentials.length !== 1 && "s"}
              </p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18cb96] to-[#059669] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#18cb96]/20 transition-all hover:shadow-xl hover:shadow-[#18cb96]/30 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Credential
            </button>
          </div>

          {/* ── Filters ────────────────────────────────────────────── */}
          <div className="space-y-4 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/60 backdrop-blur-md">
            <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by ID, name, or grade..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-650 outline-none transition-all focus:border-[#18cb96] focus:ring-1 focus:ring-[#18cb96]/20"
                />
              </div>
              
              <div className="flex items-center gap-3.5">
                <div className="flex items-center gap-1 bg-zinc-950/60 border border-zinc-800 p-1 rounded-xl">
                  {["All", ...STATUSES].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase transition-all ${
                        statusFilter === s
                          ? "bg-[#18cb96] text-zinc-950 font-black shadow-md shadow-[#18cb96]/20"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-[#18cb96]/30 px-5 py-2.5 text-xs font-bold text-zinc-300 hover:text-[#18cb96] transition-all hover:bg-[#18cb96]/5 shadow-md shrink-0 cursor-pointer animate-pulse-subtle"
                >
                  <FileDown className="h-4.5 w-4.5" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Advanced Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-800/40 pt-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Course Program</label>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#18cb96] cursor-pointer"
                >
                  <option value="All">All Course Programs</option>
                  {courses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Certificate Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#18cb96] cursor-pointer"
                >
                  <option value="All">All Certificate Types</option>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Grade Achieved</label>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#18cb96] cursor-pointer"
                >
                  <option value="All">All Grades</option>
                  <option value="Distinction">Distinction</option>
                  <option value="First Class">First Class</option>
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                  <option value="D">Grade D</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Table ──────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#18cb96]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-zinc-800/60 bg-zinc-900/50">
              <Award className="mb-3 h-12 w-12 text-zinc-700" />
              <p className="text-sm text-zinc-500">No credentials found matching selected filters.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/80">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/60 bg-zinc-950/40">
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        ID
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        Recipient
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hidden md:table-cell">
                        Course
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hidden lg:table-cell">
                        Grade
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hidden lg:table-cell">
                        Issued
                      </th>
                      <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        Status
                      </th>
                      <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((cred) => (
                      <tr
                        key={cred.docId}
                        className="border-b border-zinc-800/30 transition-colors hover:bg-zinc-805/30"
                      >
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-zinc-800/60 px-2.5 py-1 font-mono text-xs font-semibold text-[#18cb96]">
                            {cred.id}
                          </span>
                          {cred.id === "SE-2026-F8A2" && (
                            <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-500">
                              DEMO
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-zinc-200">
                            {cred.name}
                          </p>
                          <p className="text-xs text-zinc-500">{cred.type}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-zinc-400 hidden md:table-cell">
                          {cred.course}
                        </td>
                        <td className="px-5 py-4 text-sm text-zinc-450 hidden lg:table-cell font-bold">
                          {cred.grade}
                        </td>
                        <td className="px-5 py-4 text-sm text-zinc-500 hidden lg:table-cell">
                          {formatDate(cred.issueDate)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={cred.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDownload(cred)}
                              disabled={downloadingId === cred.id}
                              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-[#18cb96] disabled:opacity-50 cursor-pointer"
                              title="Download Landscape PDF"
                            >
                              {downloadingId === cred.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-[#18cb96]" />
                              ) : (
                                <FileDown className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => openEdit(cred)}
                              className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            {allowDelete && (
                              <button
                                onClick={() => setDeleting(cred.docId)}
                                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Certificate Templates Design Tab ───────────────────── */
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
              Certificate Customization Hub
            </h1>
            <p className="text-sm text-zinc-400">
              Select a certificate type to customize titles, signatory parameters, seals, and compliance footnotes. Changes are applied instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 items-start">
            {/* Left side editor panel */}
            <div className="space-y-5">
              {/* Type Category Grid */}
              <div className="space-y-3 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/60 backdrop-blur-md">
                <label className="block text-[11px] font-bold text-zinc-450 uppercase tracking-wider">
                  Select Certificate Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedDesignType(t)}
                      className={`flex flex-col items-start gap-1 p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        selectedDesignType === t
                          ? "border-[#18cb96] bg-[#18cb96]/5 text-white shadow-lg shadow-[#18cb96]/5"
                          : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-250"
                      }`}
                    >
                      <span className="text-xs font-bold leading-tight">{t}</span>
                      <span className="text-[10px] text-zinc-550 leading-none">Dynamic PDF Template</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor Form Card */}
              {loadingDesign ? (
                <div className="flex h-64 items-center justify-center bg-zinc-900/20 rounded-2xl border border-zinc-805/40">
                  <Loader2 className="h-8 w-8 animate-spin text-[#18cb96]" />
                </div>
              ) : (
                <form onSubmit={handleSaveDesign} className="space-y-4 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800/60 backdrop-blur-md">
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">
                        Certificate Title Text
                      </label>
                      <input
                        type="text"
                        value={designForm.title}
                        onChange={(e) => setDesignForm({ ...designForm, title: e.target.value })}
                        required
                        placeholder="e.g. Certificate of Competency"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white outline-none focus:border-[#18cb96] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">
                        Subtitle Paragraph - Line 1
                      </label>
                      <textarea
                        rows={2}
                        value={designForm.subtitle1}
                        onChange={(e) => setDesignForm({ ...designForm, subtitle1: e.target.value })}
                        required
                        placeholder="This document certifies that the following candidate has successfully completed..."
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-[#18cb96] transition-all leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">
                        Subtitle Paragraph - Line 2
                      </label>
                      <textarea
                        rows={2}
                        value={designForm.subtitle2}
                        onChange={(e) => setDesignForm({ ...designForm, subtitle2: e.target.value })}
                        required
                        placeholder="coding assignments, and guided industry internships..."
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-zinc-300 outline-none focus:border-[#18cb96] transition-all leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-455 uppercase tracking-wider mb-1.5">
                          Authorized Signatory Name
                        </label>
                        <input
                          type="text"
                          value={designForm.signatoryName}
                          onChange={(e) => setDesignForm({ ...designForm, signatoryName: e.target.value })}
                          required
                          placeholder="e.g. N. Sandeep"
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white outline-none focus:border-[#18cb96] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-455 uppercase tracking-wider mb-1.5">
                          Authorized Signatory Title
                        </label>
                        <input
                          type="text"
                          value={designForm.signatoryTitle}
                          onChange={(e) => setDesignForm({ ...designForm, signatoryTitle: e.target.value })}
                          required
                          placeholder="e.g. DIRECTOR, SANDEVEX LABS"
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white outline-none focus:border-[#18cb96] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-455 uppercase tracking-wider mb-1.5">
                          Signatory Sub-Title (Footnote)
                        </label>
                        <input
                          type="text"
                          value={designForm.signatorySub}
                          onChange={(e) => setDesignForm({ ...designForm, signatorySub: e.target.value })}
                          placeholder="e.g. Sand-Hut Tech Solutions"
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white outline-none focus:border-[#18cb96] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-455 uppercase tracking-wider mb-1.5">
                          Seal Gold Character
                        </label>
                        <input
                          type="text"
                          maxLength={1}
                          value={designForm.sealS}
                          onChange={(e) => setDesignForm({ ...designForm, sealS: e.target.value.toUpperCase() })}
                          required
                          placeholder="e.g. S"
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white text-center font-bold outline-none focus:border-[#18cb96] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-450 uppercase tracking-wider mb-1.5">
                        Footer Compliance & Accreditation Text
                      </label>
                      <input
                        type="text"
                        value={designForm.footerText}
                        onChange={(e) => setDesignForm({ ...designForm, footerText: e.target.value })}
                        required
                        placeholder="POWERED BY SAND-HUT TECH SOLUTIONS • ISO 9001:2015 ACCREDITED"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-white outline-none focus:border-[#18cb96] transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-3.5 flex justify-end">
                    <button
                      type="submit"
                      disabled={savingDesign}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18cb96] to-[#059669] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#18cb96]/20 transition-all hover:shadow-xl hover:shadow-[#18cb96]/30 disabled:opacity-60 cursor-pointer"
                    >
                      {savingDesign && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                      Save Design Template
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right side live digital mockup */}
            <div className="space-y-4 lg:sticky lg:top-6">
              <label className="block text-[11px] font-bold text-zinc-450 uppercase tracking-wider">
                Live Dynamic Certificate Mockup
              </label>
              
              <div className="relative w-full aspect-[297/210] rounded-2xl bg-[#fdfbf7] p-[5%] text-zinc-900 border border-zinc-800 shadow-2xl flex flex-col justify-between overflow-hidden">
                {/* Outer dark border */}
                <div className="absolute inset-[3.5%] border-[1.2px] border-slate-900 pointer-events-none"></div>
                {/* Inner gold border */}
                <div className="absolute inset-[4.3%] border-[0.6px] border-amber-600 pointer-events-none"></div>
                {/* Corner gold ticks */}
                <div className="absolute top-[5%] left-[5%] w-2 h-2 bg-amber-600"></div>
                <div className="absolute top-[5%] right-[5%] w-2 h-2 bg-amber-600"></div>
                <div className="absolute bottom-[5%] left-[5%] w-2 h-2 bg-amber-600"></div>
                <div className="absolute bottom-[5%] right-[5%] w-2 h-2 bg-amber-600"></div>

                {/* Content container */}
                <div className="relative z-10 flex flex-col justify-between h-full items-center text-center">
                  
                  {/* Top Seal & Header */}
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center w-[9%] aspect-square rounded-full bg-amber-400 border border-amber-600 shadow-md">
                      <span className="text-[120%] font-serif font-extrabold text-white leading-none">
                        {designForm.sealS || "S"}
                      </span>
                    </div>
                    <span className="text-[5.5px] sm:text-[6.5px] tracking-[0.2em] font-sans font-bold text-slate-500 mt-[1%]">
                      SANDEVEX LABS & REGISTRY NETWORK
                    </span>
                  </div>

                  {/* Core certificate titles */}
                  <div className="w-full flex flex-col items-center gap-[1.5%] my-auto">
                    <h4 className="text-[120%] sm:text-[145%] font-serif font-black text-slate-900 leading-tight">
                      {designForm.title || "Certificate of Competency"}
                    </h4>
                    <p className="text-[6px] sm:text-[7.5px] font-serif italic text-slate-650 max-w-[90%] leading-relaxed mt-1">
                      {designForm.subtitle1 || "This document certifies that the following candidate has successfully completed all required modules,"}
                    </p>
                    <p className="text-[6px] sm:text-[7.5px] font-serif italic text-slate-650 max-w-[90%] leading-relaxed">
                      {designForm.subtitle2 || "coding assignments, and guided industry internships..."}
                    </p>

                    {/* Candidate Name */}
                    <h3 className="text-[140%] sm:text-[175%] font-serif font-bold text-amber-800 mt-[2.5%] leading-none">
                      Jane Doe
                    </h3>
                    <div className="w-[50%] h-[0.5px] bg-amber-600 mt-[1.5%]"></div>
                    
                    <p className="text-[6px] sm:text-[7px] font-serif italic text-slate-500 mt-[2.5%]">
                      for outstanding academic accomplishments and mastery of the course path
                    </p>
                    <h5 className="text-[9px] sm:text-[11px] font-sans font-bold text-slate-900 mt-[1%]">
                      Fullstack Web Engineering
                    </h5>
                    <p className="text-[5.5px] sm:text-[6.5px] font-serif italic text-slate-500 mt-[0.5%]">
                      Awarded with Grade: Distinction  •  Issued on 02-Mar-2026  •  Credential Status: Active
                    </p>
                  </div>

                  {/* Footer columns */}
                  <div className="w-full grid grid-cols-3 items-end pt-[1%] border-t-[0.4px] border-slate-200">
                    {/* Left Signatory */}
                    <div className="flex flex-col items-center text-center">
                      <span className="text-[7.5px] sm:text-[9.5px] font-serif italic text-slate-800 leading-none">
                        {designForm.signatoryName || "N. Sandeep"}
                      </span>
                      <div className="w-[60%] h-[0.3px] bg-slate-400 my-[2%]"></div>
                      <span className="text-[5px] sm:text-[6px] font-sans font-extrabold text-slate-500 leading-none">
                        {designForm.signatoryTitle || "DIRECTOR, SANDEVEX LABS"}
                      </span>
                      <span className="text-[4px] sm:text-[5px] font-sans text-slate-400 leading-none mt-[1%]">
                        {designForm.signatorySub || "Sand-Hut Tech Solutions"}
                      </span>
                    </div>

                    {/* Center Status */}
                    <div className="flex flex-col items-center justify-center gap-[2%]">
                      <div className="bg-emerald-100 border border-emerald-250 text-emerald-800 text-[4px] sm:text-[5px] font-sans font-extrabold px-[6%] py-[2%] rounded-full leading-none">
                        ✓ SECURE LEDGER VERIFIED
                      </div>
                      <span className="text-[5px] sm:text-[6px] font-sans font-bold text-slate-700 leading-none mt-[2%]">
                        Serial: SE-2026-F8A2
                      </span>
                      <span className="text-[3.5px] sm:text-[4.5px] font-sans text-slate-400 leading-none mt-[1%]">
                        Registry Node: Sand-Hut Mainnet
                      </span>
                    </div>

                    {/* Right QR Frame */}
                    <div className="flex flex-col items-center">
                      <div className="w-[20%] aspect-square border-[0.3px] border-slate-300 p-[1.5%] flex items-center justify-center bg-white">
                        {/* QR placeholder */}
                        <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center p-[5%] gap-[5%]">
                          <div className="grid grid-cols-4 gap-[2%] w-full h-full">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div key={i} className={`aspect-square ${i % 3 === 0 || i % 7 === 1 ? 'bg-white' : 'bg-transparent'}`}></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[4px] sm:text-[5px] font-sans font-extrabold text-slate-400 mt-[2%] leading-none">
                        SCAN TO VERIFY PATH
                      </span>
                    </div>
                  </div>
                </div>

                {/* Core bottom-most compliance text */}
                <div className="absolute bottom-[2%] left-0 right-0 text-center">
                  <span className="text-[3.5px] sm:text-[4.5px] font-sans font-bold tracking-widest text-slate-400 uppercase">
                    {designForm.footerText || "POWERED BY SAND-HUT TECH SOLUTIONS • ISO 9001:2015 ACCREDITED"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Modal ───────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg animate-scale-in rounded-2xl border border-zinc-800/60 bg-zinc-900 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editing ? "Edit Credential" : "Add Credential"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Credential ID
                  </label>
                  <input
                    type="text"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    required
                    disabled={true}
                    placeholder="SX-2025-0001"
                    className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-650 outline-none transition-all focus:border-[#18cb96]/50 focus:ring-2 focus:ring-[#18cb96]/20 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Recipient Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-655 outline-none transition-all focus:border-[#18cb96]/50 focus:ring-2 focus:ring-[#18cb96]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Course
                </label>
                <select
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-[#18cb96]/50 focus:ring-2 focus:ring-[#18cb96]/20 cursor-pointer"
                >
                  {courses.map((c) => (
                    <option key={c} value={c} className="bg-zinc-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Grade
                  </label>
                  <input
                    type="text"
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    required
                    placeholder="A+"
                    className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white placeholder-zinc-650 outline-none transition-all focus:border-[#18cb96]/50 focus:ring-2 focus:ring-[#18cb96]/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) =>
                      setForm({ ...form, issueDate: e.target.value })
                    }
                    required
                    className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-[#18cb96]/50 focus:ring-2 focus:ring-[#18cb96]/20 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-[#18cb96]/50 focus:ring-2 focus:ring-[#18cb96]/20 cursor-pointer"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-zinc-900">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Certificate Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-[#18cb96]/50 focus:ring-2 focus:ring-[#18cb96]/20 cursor-pointer"
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t} className="bg-zinc-900">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-zinc-700/50 px-5 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#18cb96] to-[#059669] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#18cb96]/20 transition-all hover:shadow-xl hover:shadow-[#18cb96]/30 disabled:opacity-60 cursor-pointer"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ─────────────────────────────────── */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm animate-scale-in rounded-2xl border border-zinc-800/60 bg-zinc-900 p-6 shadow-2xl">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Credential</h3>
            <p className="mt-2 text-sm text-zinc-400">
              This action cannot be undone. The credential will be permanently
              removed from the system database.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="rounded-xl border border-zinc-700/50 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleting)}
                disabled={deleteLoading}
                className="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-60 cursor-pointer"
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
