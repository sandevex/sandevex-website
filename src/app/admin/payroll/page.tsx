"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/components/AdminContext";
import { Calculator, Download, Calendar, DollarSign, Clock, Lock, FileText, CheckCircle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PayrollPage() {
  const { role, user } = useAdmin();
  const [payroll, setPayroll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  useEffect(() => {
    // Set default month to current
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    setMonth(`${yyyy}-${mm}`);
  }, []);

  useEffect(() => {
    if (month && role) {
      fetchPayroll();
    }
  }, [month, role]);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/payroll?month=${month}&role=${role}&email=${encodeURIComponent(user?.email || "")}`);
      const data = await res.json();
      setPayroll(data.payroll || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonth(e.target.value);
  };

  // Indian Number-to-Words Converter
  const convertNumberToIndianWords = (num: number): string => {
    if (num === 0) return "Rupees Zero Only";
    
    const a = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
      "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const numToWords = (n: number, suffix: string): string => {
      let str = "";
      if (n > 19) {
        str += b[Math.floor(n / 10)] + " " + a[n % 10];
      } else if (n > 0) {
        str += a[n];
      }
      if (n > 0) {
        str += " " + suffix + " ";
      }
      return str;
    };

    let res = "";
    res += numToWords(Math.floor(num / 10000000), "Crore");
    res += numToWords(Math.floor((num / 100000) % 100), "Lakh");
    res += numToWords(Math.floor((num / 1000) % 100), "Thousand");
    res += numToWords(Math.floor((num / 100) % 10), "Hundred");
    
    const remaining = Math.floor(num % 100);
    if (remaining > 0) {
      if (res !== "") res += "and ";
      if (remaining > 19) {
        res += b[Math.floor(remaining / 10)] + " " + a[remaining % 10];
      } else {
        res += a[remaining];
      }
    }

    return "Rupees " + res.trim().replace(/\s+/g, " ") + " Only";
  };

  // Standard Indian Statutory Payslip Download Engine
  const downloadPayslip = (record: any) => {
    try {
      showToast("Generating authentic Indian statutory payslip...");
      
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;

      // --- CALCULATIONS (INR ₹) ---
      const gross = record.totalPay || 0;
      const basic = Number((gross * 0.5).toFixed(2));
      const hra = Number((gross * 0.3).toFixed(2));
      const specAllow = Number((gross * 0.2).toFixed(2));

      let pf = 0;
      if (record.hasPF) pf = Number((basic * 0.12).toFixed(2));
      
      let esi = 0;
      if (record.hasESI) esi = Number((gross * 0.0075).toFixed(2));

      let pt = 0;
      if (record.hasPT && gross > 0) pt = 200; // Flat 200 standard in Karnataka

      let tds = 0;
      if (record.hasTDS) {
        const pct = record.tdsPercent || 10;
        tds = Number((gross * (pct / 100)).toFixed(2));
      }

      const totalDeductions = Number((pf + esi + pt + tds).toFixed(2));
      const netPay = Number((gross - totalDeductions).toFixed(2));

      // B. A4 background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Corporate Stripe
      doc.setFillColor(24, 203, 150); // Sandevex primary green
      doc.rect(0, 0, pageWidth, 4.5, "F");

      // Sandevex Logo & Title
      doc.setTextColor(24, 203, 150);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(23);
      doc.text("SANDEVEX", 14, 18);

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("PROFESSIONAL DEVELOPMENT & SECURE CREDENTIALS REGISTRY", 14, 23);

      // Company Address Detail Box
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("SANDEVEX LABS PRIVATE LIMITED", 115, 15);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      const companyAddressLines = [
        "No. 23 Anugraha Enclave, Nandagokula Nilaya,",
        "Kadabegere, Magadi Main Rd, Nr Janpriya Bangalore,",
        "Bangalore, Karnataka 562130, India",
        "CIN: U72900KA2023PTC170142"
      ];
      doc.text(companyAddressLines, 115, 19);

      // Horizontal Divider
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(14, 35, pageWidth - 14, 35);

      // Payroll Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`PAYSLIP FOR THE MONTH OF: ${month.toUpperCase()}`, 14, 42);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated Date: ${new Date().toLocaleDateString("en-IN")}`, 158, 42);

      // Employee Information (2-Column Slate block)
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 47, pageWidth - 28, 44, 2, 2, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 47, pageWidth - 28, 44, "D");

      // Center Divider line
      doc.line(pageWidth / 2, 47, pageWidth / 2, 91);

      // Left Column Details
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.text("EMPLOYEE SUMMARY", 18, 52);
      doc.line(18, 54, 98, 54);

      doc.setTextColor(15, 23, 42);
      doc.text("Name:", 18, 60);
      doc.text("Email:", 18, 66);
      doc.text("Designation:", 18, 72);
      doc.text("PAN Card No:", 18, 78);
      doc.text("Aadhaar No:", 18, 84);

      doc.setFont("helvetica", "normal");
      doc.text(record.name, 45, 60);
      doc.text(record.email, 45, 66);
      doc.text(record.role ? record.role.toUpperCase() : "STAFF", 45, 72);
      doc.text(record.pan || "N/A", 45, 78);
      doc.text(record.aadhaar || "N/A", 45, 84);

      // Right Column Details
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text("BANK & STATUTORY DATA", pageWidth / 2 + 4, 52);
      doc.line(pageWidth / 2 + 4, 54, pageWidth - 18, 54);

      doc.setTextColor(15, 23, 42);
      doc.text("Bank Name:", pageWidth / 2 + 4, 60);
      doc.text("Account No:", pageWidth / 2 + 4, 66);
      doc.text("IFSC Code:", pageWidth / 2 + 4, 72);
      doc.text("Residential:", pageWidth / 2 + 4, 78);

      doc.setFont("helvetica", "normal");
      doc.text(record.bankName || "N/A", pageWidth / 2 + 28, 60);
      doc.text(record.bankAccount || "N/A", pageWidth / 2 + 28, 66);
      doc.text(record.ifsc || "N/A", pageWidth / 2 + 28, 72);
      
      const wrappedAddress = doc.splitTextToSize(record.address || "N/A", 74);
      doc.text(wrappedAddress, pageWidth / 2 + 28, 78);

      // LEDGER SECTION TITLES
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8.5);
      doc.text("EARNINGS LEDGER", 14, 98);
      doc.text("STATUTORY DEDUCTIONS", pageWidth / 2 + 2, 98);

      // Side-by-side tables
      autoTable(doc, {
        startY: 101,
        margin: { left: 14, right: pageWidth / 2 + 2 },
        head: [["Description", "Amount"]],
        body: [
          ["Basic Salary (50%)", `₹ ${basic.toLocaleString("en-IN")}`],
          ["House Rent Allowance (30%)", `₹ ${hra.toLocaleString("en-IN")}`],
          ["Special Allowance (20%)", `₹ ${specAllow.toLocaleString("en-IN")}`],
          ["Gross Wages Earned", `₹ ${gross.toLocaleString("en-IN")}`],
        ],
        theme: "striped",
        headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
        styles: { fontSize: 7.5 }
      });

      autoTable(doc, {
        startY: 101,
        margin: { left: pageWidth / 2 + 2, right: 14 },
        head: [["Deduction Type", "Amount"]],
        body: [
          ["Provident Fund (PF)", record.hasPF ? `₹ ${pf.toLocaleString("en-IN")}` : "N/A (Opted Out)"],
          ["Employee Insurance (ESI)", record.hasESI ? `₹ ${esi.toLocaleString("en-IN")}` : "N/A (Opted Out)"],
          ["Professional Tax (PT)", record.hasPT ? `₹ ${pt.toLocaleString("en-IN")}` : "N/A (Opted Out)"],
          ["Income TDS", record.hasTDS ? `₹ ${tds.toLocaleString("en-IN")} (${record.tdsPercent}%)` : "N/A (Opted Out)"],
          ["Total Deductions", `₹ ${totalDeductions.toLocaleString("en-IN")}`],
        ],
        theme: "striped",
        headStyles: { fillColor: [220, 38, 38], fontSize: 8 }, // Red header for deductions
        styles: { fontSize: 7.5 }
      });

      const finalY = Math.max(
        (doc as any).lastAutoTable?.finalY || 
        (doc as any).previousAutoTable?.finalY || 
        155
      );

      // NET TAKE HOME CARD
      doc.setFillColor(240, 253, 250); // Light teal/emerald background
      doc.roundedRect(14, finalY + 8, pageWidth - 28, 16, 2, 2, "F");
      doc.setDrawColor(45, 212, 191);
      doc.rect(14, finalY + 8, pageWidth - 28, 16, "D");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("NET TAKE-HOME COMPENSATION:", 18, finalY + 18);

      doc.setTextColor(13, 148, 136); // Teal primary
      doc.setFontSize(13);
      doc.text(`₹ ${netPay.toLocaleString("en-IN")}/-`, 135, finalY + 18);

      // Salary in words
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      const payInWords = convertNumberToIndianWords(netPay);
      doc.text(`Amount in Words: ${payInWords}`, 14, finalY + 31);

      // Footnotes & Seal
      const footerY = finalY + 39;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text([
        "1. This is a computer-generated wage summary record and requires no physical signature.",
        "2. All calculations are mapped directly from approved monthly attendance logging networks.",
        "3. Deductions adhere to Employees' Provident Fund and Karnataka Professional Tax statutory regulations.",
        "4. Contact the corporate accounts desk or candidate relations for any tax reconciliation inquiries.",
      ], 14, footerY);

      // Circular Corporate Stamp Seal
      doc.setDrawColor(24, 203, 150);
      doc.setLineWidth(0.4);
      doc.ellipse(176, footerY + 12, 13, 13, "D");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(24, 203, 150);
      doc.text("SANDEVEX", 176, footerY + 9, { align: "center" });
      doc.text("LABS", 176, footerY + 13, { align: "center" });
      doc.text("OFFICIAL SEAL", 176, footerY + 17, { align: "center" });

      doc.save(`Sandevex_Payslip_${record.name.replace(/\s+/g, '_')}_${month}.pdf`);
      showToast("Payslip downloaded successfully!");
    } catch (error) {
      console.error(error);
      showToast("Failed to generate Payslip. Contact accounts.");
    }
  };

  // Availability Lock Check
  const isPayslipAvailable = (monthStr: string) => {
    // Current month logs are never finalized until the next month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed
    const currentDay = now.getDate();

    const [pYear, pMonth] = monthStr.split("-").map(Number);

    if (pYear < currentYear) return true;
    if (pYear === currentYear) {
      if (pMonth < currentMonth - 1) return true;
      if (pMonth === currentMonth - 1) {
        return currentDay >= 5; // Available from the 5th onwards
      }
    }
    return false;
  };

  const isAdminOrAccountant = role === "admin" || role === "superadmin" || role === "accountant";

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const grandTotal = payroll.reduce((acc, curr) => acc + curr.totalPay, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      {/* Toast Alert Popups */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 rounded-xl bg-zinc-900 px-5 py-3.5 text-xs font-semibold text-white shadow-2xl dark:bg-white dark:text-zinc-950 flex items-center gap-2 animate-scale-in border border-zinc-800 dark:border-none">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isAdminOrAccountant ? "Payroll & Compensation" : "My Earnings & Payslips"}
          </h1>
          <p className="text-zinc-400">
            {isAdminOrAccountant 
              ? "Calculate monthly payouts based on approved attendance logs and benefit flags."
              : "Access your compensation logs, hourly rates, statutory deductions, and payslips."}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-2 pl-4 rounded-xl">
          <Calendar className="text-emerald-500" size={20} />
          <input
            type="month"
            value={month}
            onChange={handleMonthChange}
            className="bg-transparent text-white focus:outline-none cursor-pointer text-sm"
          />
        </div>
      </div>

      {/* --- PERSONAL EMPLOYEE SELF-SERVICE VIEW --- */}
      {!isAdminOrAccountant && (
        <div className="space-y-8 animate-fade-in-up">
          {payroll.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
              <Clock className="mx-auto mb-4 text-zinc-600" size={40} />
              <p className="text-sm">No payroll records logged for you in {month} yet.</p>
            </div>
          ) : (
            <>
              {/* Earnings Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-2">Total Hours Worked</span>
                  <div className="flex items-center gap-3">
                    <Clock className="text-emerald-400" size={24} />
                    <h2 className="text-3xl font-bold">{payroll[0].totalHours} hrs</h2>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mb-2">Hourly Payout Rate</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 text-2xl font-bold">₹</span>
                    <h2 className="text-3xl font-bold">{payroll[0].hourlyRate}/hr</h2>
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />
                  <span className="text-teal-400 text-xs font-semibold uppercase tracking-wider block mb-2">Estimated Gross Wages</span>
                  <div className="flex items-center gap-3">
                    <span className="text-teal-400 text-2xl font-bold">₹</span>
                    <h2 className="text-3xl font-bold text-white">{payroll[0].totalPay.toLocaleString("en-IN")}</h2>
                  </div>
                </div>
              </div>

              {/* Deductions & Payslip Download Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Benefits Breakdown */}
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4 border-b border-zinc-800 pb-2">Statutory Payroll Breakdown</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Allocated Earnings</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Basic Salary (50%):</span>
                          <span className="font-mono text-zinc-200">₹{(payroll[0].totalPay * 0.5).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">HRA (30%):</span>
                          <span className="font-mono text-zinc-200">₹{(payroll[0].totalPay * 0.3).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Special Allowance (20%):</span>
                          <span className="font-mono text-zinc-200">₹{(payroll[0].totalPay * 0.2).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Statutory Deductions</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Provident Fund (PF):</span>
                          <span className="font-mono text-zinc-200">
                            {payroll[0].hasPF ? `₹${((payroll[0].totalPay * 0.5) * 0.12).toFixed(2)}` : "Opted Out"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">State Insurance (ESI):</span>
                          <span className="font-mono text-zinc-200">
                            {payroll[0].hasESI ? `₹${(payroll[0].totalPay * 0.0075).toFixed(2)}` : "Opted Out"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Professional Tax (PT):</span>
                          <span className="font-mono text-zinc-200">
                            {payroll[0].hasPT && payroll[0].totalPay > 0 ? "₹200.00" : "Opted Out"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Income TDS:</span>
                          <span className="font-mono text-zinc-200">
                            {payroll[0].hasTDS ? `₹${(payroll[0].totalPay * (payroll[0].tdsPercent / 100)).toFixed(2)} (${payroll[0].tdsPercent}%)` : "Opted Out"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payslip Lock/Download Panel */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Monthly Payslip</h3>
                    <p className="text-xs text-zinc-500 mb-6">Payslips become finalized and available on the 5th day of the following month.</p>
                  </div>

                  {isPayslipAvailable(month) ? (
                    <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 text-center space-y-4">
                      <FileText className="mx-auto text-emerald-400" size={32} />
                      <div>
                        <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest">WAGES FINALIZED</p>
                        <p className="text-sm text-white mt-1">Official payslip for {month} is ready.</p>
                      </div>
                      <button
                        onClick={() => downloadPayslip(payroll[0])}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Download size={16} /> Download Payslip PDF
                      </button>
                    </div>
                  ) : (
                    <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-4 text-center space-y-4">
                      <Lock className="mx-auto text-zinc-600" size={32} />
                      <div>
                        <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">PENDING COMPILATION</p>
                        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                          The payroll cycle for {month} will lock and release on the **5th of next month**.
                        </p>
                      </div>
                      <button
                        disabled
                        className="w-full bg-zinc-800 text-zinc-600 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                      >
                        <Lock size={14} /> Locked Until 5th
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* --- ADMINISTRATIVE MANAGER VIEW --- */}
      {isAdminOrAccountant && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400 text-sm font-medium">Total Staff on Payroll</span>
                <div className="h-10 w-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                  <Calculator size={20} />
                </div>
              </div>
              <h2 className="text-3xl font-bold">{payroll.length}</h2>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-zinc-400 text-sm font-medium">Total Hours Logged</span>
                <div className="h-10 w-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
                  <Clock size={20} />
                </div>
              </div>
              <h2 className="text-3xl font-bold">{payroll.reduce((acc, curr) => acc + curr.totalHours, 0).toFixed(2)} hrs</h2>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-emerald-400 text-sm font-medium">Total Monthly Payout</span>
                <div className="h-10 w-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
                  <span className="text-emerald-400 text-lg font-bold">₹</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white">₹{grandTotal.toLocaleString("en-IN")}</h2>
            </div>
          </div>

          {/* Admin Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-950 text-zinc-400 text-sm">
                  <tr>
                    <th className="p-4 font-medium">Staff Member</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium text-right">Hourly Rate</th>
                    <th className="p-4 font-medium text-right">Total Hours</th>
                    <th className="p-4 font-medium text-right text-emerald-400">Total Wages</th>
                    <th className="p-4 font-medium text-center">Payslip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-sm">
                  {payroll.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-zinc-500">No payroll data logged for this month.</td>
                    </tr>
                  ) : (
                    payroll.map((record) => (
                      <tr key={record.email} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-white">{record.name}</p>
                          <p className="text-xs text-zinc-500">{record.email}</p>
                        </td>
                        <td className="p-4 capitalize text-zinc-400">{record.role}</td>
                        <td className="p-4 text-right font-mono">₹{record.hourlyRate || 0}/hr</td>
                        <td className="p-4 text-right font-mono">{record.totalHours}</td>
                        <td className="p-4 text-right font-mono font-bold text-emerald-400">₹{record.totalPay.toLocaleString("en-IN")}</td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => downloadPayslip(record)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-lg inline-flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                            title="Download Indian Compliant PDF Payslip"
                          >
                            <Download size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
