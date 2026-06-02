"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/components/AdminContext";
import { Users, Plus, Edit2, Trash2, Shield, User } from "lucide-react";

export default function TeamPage() {
  const { isAdmin, role: currentAdminRole, allowDelete: activeUserCanDelete } = useAdmin();
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("instructor");
  const [status, setStatus] = useState("Active");
  const [hourlyRate, setHourlyRate] = useState("0");
  const [uid, setUid] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Male");
  const [allowDelete, setAllowDelete] = useState(false);

  // Statutory & Bank State
  const [address, setAddress] = useState("");
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifsc, setIfsc] = useState("");

  // Benefit Selection flags
  const [hasPF, setHasPF] = useState(false);
  const [hasESI, setHasESI] = useState(false);
  const [hasPT, setHasPT] = useState(false);
  const [hasTDS, setHasTDS] = useState(false);
  const [tdsPercent, setTdsPercent] = useState("10");

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setTeam(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("instructor");
    setStatus("Active");
    setHourlyRate("0");
    setUid("");
    setDob("");
    setPhone("");
    setGender("Male");
    setAllowDelete(false);
    setAddress("");
    setPan("");
    setAadhaar("");
    setBankName("");
    setBankAccount("");
    setIfsc("");
    setHasPF(false);
    setHasESI(false);
    setHasPT(false);
    setHasTDS(false);
    setTdsPercent("10");
    setEditingMember(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (member: any) => {
    setName(member.name);
    setEmail(member.email);
    setPassword(""); 
    setRole(member.role || "instructor");
    setStatus(member.status || "Active");
    setHourlyRate(member.hourlyRate?.toString() || "0");
    setUid(member.uid || "");
    setDob(member.dob || "");
    setPhone(member.phone || "");
    setGender(member.gender || "Male");
    setAllowDelete(!!member.allowDelete);
    setAddress(member.address || "");
    setPan(member.pan || "");
    setAadhaar(member.aadhaar || "");
    setBankName(member.bankName || "");
    setBankAccount(member.bankAccount || "");
    setIfsc(member.ifsc || "");
    setHasPF(!!member.hasPF);
    setHasESI(!!member.hasESI);
    setHasPT(!!member.hasPT);
    setHasTDS(!!member.hasTDS);
    setTdsPercent(member.tdsPercent?.toString() || "10");
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { 
        name, email, role, status, hourlyRate: Number(hourlyRate),
        address, pan, aadhaar, bankName, bankAccount, ifsc,
        hasPF, hasESI, hasPT, hasTDS, tdsPercent: Number(tdsPercent),
        dob, phone, gender, allowDelete
      };
      if (password) payload.password = password;

      if (editingMember) {
        payload.uid = uid;
        const res = await fetch(`/api/users/${editingMember.docId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update user");
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to create user");
        }
      }

      setIsModalOpen(false);
      resetForm();
      fetchTeam();
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to completely remove this user? This cannot be undone.")) return;
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      fetchTeam();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    }
  };

  if (!isAdmin || currentAdminRole === "staff") {
    return <div className="p-8 text-white">Access Denied. Admin and Superadmin only.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Directory</h1>
          <p className="text-zinc-400">Manage internal staff, accountants, and admin access.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-lg shadow-emerald-500/20"
        >
          <Plus size={20} />
          Add Member
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <div key={member.docId} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center text-emerald-400">
                  {member.role === 'admin' || member.role === 'superadmin' ? <Shield size={24} /> : <User size={24} />}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {member.status}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-1">{member.name || 'Unnamed Member'}</h3>
              
              <div className="flex gap-2 items-center mb-3 text-[10px] text-zinc-450 font-semibold uppercase tracking-wider flex-wrap">
                <span className="bg-zinc-950 px-2 py-0.5 rounded text-zinc-500 text-[9px] font-bold">{member.gender || "Male"}</span>
                <span>•</span>
                <span>DOB: {member.dob || "Not Specified"}</span>
                {member.allowDelete && (
                  <>
                    <span>•</span>
                    <span className="bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded text-rose-400 text-[8px] font-bold">🗑️ Deletion Access</span>
                  </>
                )}
              </div>

              <div className="text-zinc-400 text-sm mb-4 flex flex-col gap-0.5 text-left">
                <span className="font-mono">{member.email}</span>
                {member.phone && <span className="text-xs text-zinc-500 font-sans mt-0.5">📞 {member.phone}</span>}
              </div>

              <div className="space-y-3 mb-6 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">System Role:</span>
                  <span className="font-medium text-white capitalize">{member.role}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Hourly Rate:</span>
                  <span className="font-mono text-emerald-400">₹{member.hourlyRate || 0}/hr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Benefits:</span>
                  <span className="text-xs text-emerald-400 font-semibold truncate max-w-[150px]">
                    {[
                      member.hasPF && "PF",
                      member.hasESI && "ESI",
                      member.hasPT && "PT",
                      member.hasTDS && `TDS (${member.tdsPercent}%)`
                    ].filter(Boolean).join(", ") || "None"}
                  </span>
                </div>
                {member.pan && (
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">PAN Card:</span>
                    <span className="font-mono text-zinc-300">{member.pan}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Joined:</span>
                  <span className="text-zinc-300">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(member)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium cursor-pointer"
                >
                  <Edit2 size={16} /> Edit
                </button>
                {member.role !== "superadmin" && activeUserCanDelete && (
                  <button
                    onClick={() => handleDelete(member.docId)}
                    className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-medium cursor-pointer"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="text-emerald-500" />
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {/* SECTION 1: Credentials & Roles */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-b border-zinc-800/80 pb-1.5">
                  1. Account Credentials & Roles
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="e.g. Jane Doe"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="jane@sandevex.com"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      {editingMember ? "New Password (blank to keep)" : "Temporary Password"}
                    </label>
                    <input
                      type="password"
                      required={!editingMember}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">System Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="instructor">Instructor / Trainer</option>
                      <option value="staff">Staff Member</option>
                      <option value="accountant">Accountant</option>
                      <option value="admin">Administrator</option>
                      {editingMember?.role === "superadmin" && <option value="superadmin">Super Admin</option>}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Statutory Identifiers */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-b border-zinc-800/80 pb-1.5">
                  2. Statutory Identifiers
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">PAN Card Number</label>
                    <input
                      type="text"
                      value={pan}
                      onChange={(e) => setPan(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors uppercase"
                      placeholder="e.g. ABCDE1234F"
                      maxLength={10}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Aadhaar Card Number</label>
                    <input
                      type="text"
                      value={aadhaar}
                      onChange={(e) => setAadhaar(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="e.g. 1234 5678 9012"
                      maxLength={14}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Residential Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Full residential address..."
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Bank Account Ledger */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-b border-zinc-800/80 pb-1.5">
                  3. Bank Account Ledger
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3 md:col-span-1">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="e.g. HDFC Bank"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-1">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Account Number..."
                    />
                  </div>
                  <div className="col-span-3 md:col-span-1">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors uppercase"
                      placeholder="IFSC Code..."
                      maxLength={11}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Compensation & Benefit Selections */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-b border-zinc-800/80 pb-1.5">
                  4. Compensation & Deductions
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Hourly Rate (₹)</label>
                    <input
                      type="number"
                      required
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="e.g. 500"
                    />
                  </div>
                  
                  <div className="col-span-2 grid grid-cols-2 gap-3 bg-zinc-950/30 p-4 border border-zinc-800/60 rounded-xl animate-fade-in-up">
                    <label className="flex items-center gap-2.5 text-xs text-zinc-300 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasPF}
                        onChange={(e) => setHasPF(e.target.checked)}
                        className="rounded border-zinc-800 text-emerald-500 focus:ring-emerald-500 bg-zinc-950 h-4 w-4 cursor-pointer"
                      />
                      Enable PF (12% of Basic)
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-zinc-300 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasESI}
                        onChange={(e) => setHasESI(e.target.checked)}
                        className="rounded border-zinc-800 text-emerald-500 focus:ring-emerald-500 bg-zinc-950 h-4 w-4 cursor-pointer"
                      />
                      Enable ESI (0.75% of Gross)
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-zinc-300 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasPT}
                        onChange={(e) => setHasPT(e.target.checked)}
                        className="rounded border-zinc-800 text-emerald-500 focus:ring-emerald-500 bg-zinc-950 h-4 w-4 cursor-pointer"
                      />
                      Enable PT (₹200 Karnataka)
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-zinc-300 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasTDS}
                        onChange={(e) => setHasTDS(e.target.checked)}
                        className="rounded border-zinc-800 text-emerald-500 focus:ring-emerald-500 bg-zinc-950 h-4 w-4 cursor-pointer"
                      />
                      Enable TDS Deductions
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-zinc-300 font-medium cursor-pointer col-span-2 border-t border-zinc-800/50 pt-2.5 mt-1">
                      <input
                        type="checkbox"
                        checked={allowDelete}
                        onChange={(e) => setAllowDelete(e.target.checked)}
                        className="rounded border-zinc-800 text-rose-500 focus:ring-rose-500 bg-zinc-950 h-4 w-4 cursor-pointer accent-rose-500"
                      />
                      <span className="text-rose-400 font-bold">⚠️ Allow Delete Access (Dangerous Actions)</span>
                    </label>
                  </div>

                  {hasTDS && (
                    <div className="col-span-2 animate-scale-in">
                      <label className="block text-xs font-semibold text-zinc-400 mb-1">TDS Percentage (%)</label>
                      <input
                        type="number"
                        value={tdsPercent}
                        onChange={(e) => setTdsPercent(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder="e.g. 10"
                        min={0}
                        max={100}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-zinc-800 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl transition-colors font-medium text-sm shadow-lg shadow-emerald-500/20"
                >
                  {editingMember ? "Save Changes" : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
