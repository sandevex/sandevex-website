"use client";

import React, { useState } from "react";
import { FileText, Loader2, CheckCircle } from "lucide-react";
import { generateCertificatePdf } from "@/lib/certificatePdf";

interface Certificate {
  id: string;
  name: string;
  course: string;
  grade: string;
  issueDate: string;
  status: string;
  type: string;
  issuer: string;
}

export default function DownloadCertificateClientButton({
  credential,
}: {
  credential: Certificate;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    showToast("Generating authentic landscape certificate...");
    try {
      await generateCertificatePdf(credential);
      showToast("Certificate downloaded successfully!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 rounded-xl bg-zinc-900 px-5 py-3 text-xs font-semibold text-white shadow-2xl dark:bg-white dark:text-zinc-950 flex items-center gap-2 animate-scale-in">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-xs font-semibold text-white hover:bg-brand-secondary transition disabled:opacity-60 cursor-pointer"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Generating...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" /> Download Certificate PDF
          </>
        )}
      </button>
    </>
  );
}
