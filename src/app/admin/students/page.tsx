"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Edit2, Trash2, FileText, CheckCircle, AlertCircle, Briefcase, Calendar, Clock, MapPin } from "lucide-react";
import { useAdmin } from "@/components/AdminContext";
import jsPDF from "jspdf";

export default function StudentsPage() {
  const { user, role, isAdmin, allowDelete } = useAdmin();
  const [students, setStudents] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [program, setProgram] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Male");
  const [positionTitle, setPositionTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [location, setLocation] = useState("");

  // Toaster Notifications
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (user?.email) {
      fetchStudents();
      fetchPrograms();
    }
  }, [user?.email, role]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/students?email=${encodeURIComponent(user?.email || "")}&role=${role}`);
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to fetch students roster", "error");
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
        setProgram(data.programs[0].name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    if (programs.length > 0) setProgram(programs[0].name);
    setDob("");
    setPhone("");
    setGender("Male");
    setPositionTitle("");
    setStartDate("");
    setWorkingHours("");
    setLocation("");
    setEditingItem(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setName(item.name);
    setEmail(item.email);
    setProgram(item.program);
    setDob(item.dob || "");
    setPhone(item.phone || "");
    setGender(item.gender || "Male");
    setPositionTitle(item.positionTitle || "");
    setStartDate(item.startDate || "");
    setWorkingHours(item.workingHours || "");
    setLocation(item.location || "");
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { name, email, program, dob, phone, gender };
      
      // Save internship details only if it is an Internship Program
      if (program.toLowerCase().includes("internship")) {
        payload.positionTitle = positionTitle;
        payload.startDate = startDate;
        payload.workingHours = workingHours;
        payload.location = location;
      }

      if (editingItem) {
        const res = await fetch(`/api/students/${editingItem.docId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
        showToast("Student profile updated successfully!");
      } else {
        payload.staffEmail = user?.email;
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Creation failed");
        showToast("Student profile registered successfully!");
      }

      setIsModalOpen(false);
      resetForm();
      fetchStudents();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to save student record", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this student?")) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove student");
      showToast("Student removed successfully!");
      fetchStudents();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to delete student", "error");
    }
  };

  const handleGenerateOfferLetter = (student: any) => {
    try {
      showToast("Compiling PDF offer letter...");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;

      // Pure White background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Sandevex Emerald Stripe Top Accent
      doc.setFillColor(24, 203, 150);
      doc.rect(0, 0, pageWidth, 4, "F");

      // Header
      doc.setTextColor(24, 203, 150);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("SANDEVEX", 18, 22);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("PROFESSIONAL DEVELOPMENT & SECURE CREDENTIALS REGISTRY", 18, 26);

      // Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(18, 31, pageWidth - 18, 31);

      // Current Date
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const currentDateStr = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      doc.text(`Date: ${currentDateStr}`, 18, 39);

      doc.setFont("helvetica", "bold");
      doc.text("LETTER OF INTERNSHIP OFFER", 18, 50);

      doc.setFont("helvetica", "normal");
      doc.text(`Candidate Name: ${student.name}`, 18, 58);
      doc.text(`Email Address: ${student.email}`, 18, 63);

      // Subject
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("Subject: Internship Offer & Course Enrolment Letter", 18, 74);

      // Paragraph Body
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      
      const p1 = `Dear ${student.name},`;
      const p2 = "We are pleased to offer you an internship and training position under our specialized Internship Program at Sandevex. This program is structured to provide industry-aligned projects, hands-on architectural experience, and professional development milestones.";
      const p3 = "Below are the specific details and terms of your internship position mapped to your candidate registration:";

      doc.text(p1, 18, 83);
      const p2Lines = doc.splitTextToSize(p2, pageWidth - 36);
      doc.text(p2Lines, 18, 89);
      const p3Lines = doc.splitTextToSize(p3, pageWidth - 36);
      doc.text(p3Lines, 18, 107);

      // Terms Details Box Block
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(18, 116, pageWidth - 36, 42, 2, 2, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(18, 116, pageWidth - 36, 42, "D");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      
      doc.text("Position Title:", 24, 124);
      doc.text("Start Date:", 24, 132);
      doc.text("Working Hours:", 24, 140);
      doc.text("Location:", 24, 148);

      doc.setFont("helvetica", "normal");
      doc.text(student.positionTitle || "AI Finance Technology Specialist level - 1", 56, 124);
      doc.text(student.startDate || "02-March-2026", 56, 132);
      doc.text(student.workingHours || "90 Hours", 56, 140);
      doc.text(student.location || "On-site Bengaluru", 56, 148);

      // Post-box Body paragraphs
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);

      const p4 = "During this tenure, you will work on state-of-the-art systems, acquire hands-on industry expertise, and collaborate with our engineering networks. Upon successful completion of your internship hours and milestones, you will receive a verified Sandevex Course Completion and Internship Certificate.";
      const p5 = "Please sign and return a copy of this offer letter to confirm your acceptance.";
      const p6 = "We look forward to welcoming you to the program and wishing you a highly productive internship experience.";

      const p4Lines = doc.splitTextToSize(p4, pageWidth - 36);
      doc.text(p4Lines, 18, 168);
      const p5Lines = doc.splitTextToSize(p5, pageWidth - 36);
      doc.text(p5Lines, 18, 186);
      const p6Lines = doc.splitTextToSize(p6, pageWidth - 36);
      doc.text(p6Lines, 18, 194);

      // Sign-off
      const signatureY = 226;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("For Sandevex Labs Private Limited,", 18, signatureY);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Authorized Signatory", 18, signatureY + 16);

      // Candidate Acceptance Sign lines
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text("Candidate Acceptance Signature:", 110, signatureY);
      doc.line(110, signatureY + 12, pageWidth - 18, signatureY + 12);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Date & Signature", 110, signatureY + 16);

      // Footnote Footer
      doc.setFontSize(7.5);
      doc.text("Sandevex Labs Private Limited  |  CIN: U72900KA2023PTC170142", pageWidth / 2, pageHeight - 12, { align: "center" });

      doc.save(`Sandevex_Offer_Letter_${student.name.replace(/\s+/g, "_")}.pdf`);
      showToast("Offer letter generated successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to compile offer letter", "error");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-white animate-fade-in relative">
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">Student Roster</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage enrolled students, program selections, and issue internship offer letters.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-bold shadow-lg shadow-emerald-500/20 text-xs uppercase cursor-pointer"
        >
          <Plus size={15} />
          Add Student
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 flex justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-950 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Program</th>
                  {isAdmin && <th className="p-4">Instructor</th>}
                  <th className="p-4">Clearance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-xs">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="p-12 text-center text-zinc-500">No students enrolled in Sandevex yet.</td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const isInternship = student.program?.toLowerCase().includes("internship");
                    return (
                      <tr key={student.docId} className="hover:bg-zinc-805/50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white text-sm">{student.name}</div>
                          <div className="flex gap-2 items-center mt-1 text-[10px] text-zinc-450 font-medium">
                            <span className="bg-zinc-950 px-1.5 py-0.5 rounded text-zinc-500 text-[9px] font-bold uppercase">{student.gender || "Male"}</span>
                            <span>•</span>
                            <span>DOB: {student.dob || "Not Specified"}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-zinc-400">
                          <div>{student.email}</div>
                          {student.phone && <div className="text-[10px] text-zinc-500 font-sans mt-0.5">{student.phone}</div>}
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isInternship ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {student.program}
                          </span>
                        </td>
                        {isAdmin && <td className="p-4 text-zinc-400">{student.staffEmail || "System"}</td>}
                        <td className="p-4">
                          <div className="flex gap-2.5 items-center">
                            {isInternship && (
                              <button
                                onClick={() => handleGenerateOfferLetter(student)}
                                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                              >
                                <FileText size={12} />
                                Offer Letter
                              </button>
                            )}
                            <button onClick={() => openEditModal(student)} className="p-2 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 bg-zinc-950 rounded-lg transition-colors cursor-pointer">
                              <Edit2 size={13} />
                            </button>
                            {allowDelete && (
                              <button onClick={() => handleDelete(student.docId)} className="p-2 text-rose-400 hover:text-rose-300 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 rounded-lg transition-colors cursor-pointer">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
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

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="text-emerald-500" />
                {editingItem ? "Edit Student Record" : "Register Student"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white font-bold text-lg">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Gender *</label>
                <select
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Enrolled Course Program *</label>
                <select
                  required
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none"
                >
                  {programs.map((p) => (
                    <option key={p.docId} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Internship Fields */}
              {program.toLowerCase().includes("internship") && (
                <div className="border-t border-zinc-800/80 pt-4.5 mt-4.5 space-y-4.5 animate-fade-in bg-zinc-950/40 p-4 rounded-2xl border border-zinc-850">
                  <h3 className="text-[10px] font-bold text-[#18cb96] uppercase tracking-widest flex items-center gap-1.5">
                    <Briefcase size={12} />
                    Internship Program Terms Configuration
                  </h3>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Position Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AI Finance Technology Specialist level - 1"
                      value={positionTitle}
                      onChange={(e) => setPositionTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Start Date *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 02-March-2026"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Working Hours *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 90 Hours"
                        value={workingHours}
                        onChange={(e) => setWorkingHours(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Location *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. On-site Bengaluru"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4.5 flex gap-3.5 border-t border-zinc-850">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl transition-colors font-bold text-xs">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 py-2.5 rounded-xl transition-colors font-bold text-xs shadow-lg shadow-emerald-500/20">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
