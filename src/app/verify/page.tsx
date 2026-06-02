"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Award,
  Search,
  CheckCircle,
  FileText,
  ShieldAlert,
  ArrowLeft,
  Copy,
  Info,
  Loader2,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { generateCertificatePdf } from "@/lib/certificatePdf";

interface Certificate {
  docId: string;
  id: string;
  name: string;
  course: string;
  grade: string;
  issueDate: string;
  status: "Active" | "Revoked" | "Suspended";
  type: string;
  issuer: string;
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryId = searchParams.get("id");

  const [inputVal, setInputVal] = useState("");
  const [searchedId, setSearchedId] = useState("");
  const [result, setResult] = useState<Certificate | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!result) return;
    setIsGeneratingPdf(true);
    showToast("Generating authentic landscape certificate...");
    try {
      await generateCertificatePdf(result);
      showToast("Certificate downloaded successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Track the previous query parameter so we only sync state when it actually changes
  const [prevQueryId, setPrevQueryId] = useState<string | null>(null);

  if (queryId !== prevQueryId) {
    setPrevQueryId(queryId);
    if (queryId) {
      const cleanId = queryId.trim().toUpperCase();
      setInputVal(cleanId);
      setSearchedId(cleanId);
      setHasSearched(true);
      setIsLoading(true);
      // Fetch from API
      fetch(`/api/credentials?id=${encodeURIComponent(cleanId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.found) {
            setResult(data.credential);
          } else {
            setResult(null);
          }
        })
        .catch(() => {
          setResult(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setInputVal("");
      setSearchedId("");
      setHasSearched(false);
      setResult(null);
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = inputVal.trim().toUpperCase();
    if (!cleanId) return;

    setSearchedId(cleanId);
    setHasSearched(true);
    setIsLoading(true);

    // Update URL query parameters silently
    router.replace(`/verify?id=${cleanId}`);

    try {
      const res = await fetch(`/api/credentials?id=${encodeURIComponent(cleanId)}`);
      const data = await res.json();
      if (data.found) {
        setResult(data.credential);
      } else {
        setResult(null);
      }
    } catch {
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const copyCredential = () => {
    if (result) {
      navigator.clipboard.writeText(result.id);
      showToast("Credential ID copied to clipboard!");
    }
  };

  const shareCredential = () => {
    if (result) {
      const url = `${window.location.origin}/credentials/${result.id}`;
      navigator.clipboard.writeText(url);
      showToast("Shareable credential link copied!");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-10 lg:px-12">
      
      {/* Toast Alert Popups */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 rounded-xl bg-zinc-900 px-5 py-3 text-xs font-semibold text-white shadow-2xl dark:bg-white dark:text-zinc-950 flex items-center gap-2 animate-scale-in">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Nav back */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-brand-primary transition">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      {/* Hero Headers */}
      <div className="text-left max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-3.5 py-1.5 text-xs font-semibold text-brand-primary dark:text-brand-secondary">
          <Award className="h-4 w-4" /> Secure Talents Database Registry
        </div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
          Verify Sandevex Student Credentials
        </h1>
        <p className="mt-4 text-sm sm:text-base leading-7 text-zinc-500 dark:text-zinc-400">
          We maintain a tamper-proof cryptographic ledger of all graduates. Input a certificate key to authenticate course accomplishments, grades, and internship verification in real-time.
        </p>
      </div>

      {/* Form Input Section */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0b111e] mb-10">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter Certificate Serial Key (e.g. SE-2026-F8A2)"
              className="w-full rounded-2xl border border-zinc-200 py-3.5 pl-12 pr-4 text-sm font-semibold focus:border-brand-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-2xl bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:scale-[1.01] transition disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Searching...
              </span>
            ) : (
              "Authenticate Key"
            )}
          </button>
        </form>
      </div>

      {/* Dynamic Results Display */}
      {hasSearched && !isLoading && (
        <div className="animate-fade-in-up">
          {result ? (
            /* SUCCESS CASE: CERTIFICATE IS GENUINE */
            <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
              
              {/* Premium Certificate Visual Panel */}
              <div className="relative rounded-3xl border-2 border-amber-500/30 bg-white p-6 sm:p-10 shadow-2xl dark:bg-[#070b13] overflow-hidden">
                {/* Vintage glowing backdrop styling */}
                <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl"></div>
                <div className="absolute left-0 bottom-0 translate-y-12 -translate-x-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl"></div>
                
                {/* Thin inner border */}
                <div className="absolute inset-4 rounded-2xl border border-amber-500/20 pointer-events-none"></div>

                {/* Certificate Content */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  
                  {/* Registry Emblem */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border-2 border-amber-500/20 mb-6">
                    <Award className="h-9 w-9 text-amber-500" />
                  </div>

                  <p className="text-[10px] tracking-[0.25em] font-bold text-zinc-400 uppercase dark:text-zinc-500 leading-none">
                    Verified Credentials Registry
                  </p>
                  
                  <h2 className="mt-4 text-2xl sm:text-3xl font-serif font-semibold text-zinc-900 dark:text-white">
                    Sandevex Certification of Competency
                  </h2>

                  <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed italic max-w-lg">
                    This document certifies that the following candidate has completed all required training modules, coding assignments, and guided internships under real tech environment standards.
                  </p>

                  {/* Candidate Profile Details */}
                  <div className="mt-8 flex flex-col items-center">
                    <span className="text-[11px] font-bold text-brand-primary dark:text-brand-secondary uppercase tracking-widest leading-none">
                      Candidate Name
                    </span>
                    <span className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                      {result.name}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-col items-center max-w-xl">
                    <span className="text-[11px] font-bold text-brand-primary dark:text-brand-secondary uppercase tracking-widest leading-none">
                      Course Path
                    </span>
                    <span className="mt-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {result.course}
                    </span>
                  </div>

                  {/* Stats line */}
                  <div className="mt-8 grid grid-cols-2 gap-8 border-y border-zinc-100 py-4 dark:border-zinc-900 w-full max-w-md">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        Grade Awarded
                      </span>
                      <p className="mt-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                        {result.grade}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        Issue Date
                      </span>
                      <p className="mt-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                        {result.issueDate}
                      </p>
                    </div>
                  </div>

                  {/* Signatures & Stamps */}
                  <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-8 w-full max-w-md">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-serif italic text-zinc-500 dark:text-zinc-400 font-semibold leading-none">
                        Sandevex Labs
                      </span>
                      <div className="h-px w-28 bg-zinc-200 dark:bg-zinc-800 my-2"></div>
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        Director Signature
                      </span>
                    </div>

                    {/* Gold Stamp Seal */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                          Registry Verified
                        </span>
                      </div>
                      <span className="text-[8px] font-semibold text-zinc-400 dark:text-zinc-500">
                        Serial: {result.id}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Sidebar: Details panel and corporate actions */}
              <div className="flex flex-col gap-6">
                
                {/* Meta details card */}
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0b111e]">
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                    Credential Status
                  </h3>
                  
                  <div className="mt-4 flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full animate-pulse-slow ${
                      result.status === "Active" ? "bg-emerald-500" :
                      result.status === "Revoked" ? "bg-red-500" : "bg-amber-500"
                    }`}></div>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      {result.status === "Active" ? "Officially Verified & Active" :
                       result.status === "Revoked" ? "Credential Revoked" : "Temporarily Suspended"}
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    {result.status === "Active" 
                      ? "This registry record has been successfully validated. The student holds full honors and has been logged on the Sand-Hut secure registry network."
                      : `This credential is currently ${result.status.toLowerCase()}. Please contact Sandevex Labs for more information.`
                    }
                  </p>

                  <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-900 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 dark:text-zinc-500">Verification ID:</span>
                      <button
                        onClick={copyCredential}
                        className="flex items-center gap-1 font-mono font-bold text-brand-primary dark:text-brand-secondary hover:underline"
                      >
                        {result.id} <Copy className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 dark:text-zinc-500">Credential Type:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {result.type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400 dark:text-zinc-500">Authority:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        Sand-Hut Tech Solutions
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operations Card */}
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0b111e]">
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                    Student Actions
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Add this to your professional resume and job applications.
                  </p>

                  <div className="mt-4 flex flex-col gap-2.5">
                    <button
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-brand-primary py-3 text-xs font-bold text-white transition hover:bg-brand-secondary disabled:opacity-60"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" /> Download Secure PDF
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={shareCredential}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-300 py-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                    >
                      <Share2 className="h-4 w-4" /> Copy Shareable Link
                    </button>

                    <button
                      onClick={() => showToast("Opening LinkedIn Certificate Configuration Form...")}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-300 py-3 text-xs font-bold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
                    >
                      <svg className="h-4 w-4 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect x="2" y="9" width="4" height="12" />
                        <circle cx="4" cy="4" r="2" />
                      </svg> Share on LinkedIn
                    </button>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* ERROR CASE: KEY IS NOT VALID */
            <div className="rounded-3xl border-2 border-red-500/20 bg-red-50/50 p-8 text-center dark:bg-red-950/10 max-w-2xl mx-auto flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mb-4">
                <ShieldAlert className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Credential Authentication Failed
              </h3>
              <p className="mt-2 text-xs leading-6 text-zinc-500 dark:text-zinc-400 max-w-md">
                We were unable to locate certificate key <span className="font-mono font-bold text-red-500">&ldquo;{searchedId}&rdquo;</span> inside the Sandevex secure database. Please double-check characters (excluding spaces) or reach out to candidate relations.
              </p>
              <div className="mt-6 pt-5 border-t border-zinc-200 dark:border-zinc-800 w-full flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link
                  href="/contact"
                  className="rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-secondary transition"
                >
                  Contact Candidate Support
                </Link>
                <button
                  onClick={() => setInputVal("")}
                  className="rounded-xl border border-zinc-300 px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 transition"
                >
                  Clear & Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {hasSearched && isLoading && (
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
          <div className="animate-spin h-10 w-10 border-4 border-brand-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-sm font-semibold text-zinc-500">Querying Secure Registry Database...</p>
        </div>
      )}

      {/* Helpful educational disclaimer */}
      {!hasSearched && (
        <div className="rounded-2xl border border-zinc-150 bg-zinc-50 p-5 dark:border-zinc-850 dark:bg-zinc-950/60 max-w-2xl mx-auto flex gap-3.5">
          <Info className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
          <div className="text-left text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 block mb-1">
              Recruiter & University Instructions
            </span>
            Input the 11-digit serial key located at the bottom-left of any Sandevex-issued certification. Successful lookup fetches the official registry profiles of our graduates directly from parent system databases.
          </div>
        </div>
      )}

    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto w-full max-w-5xl px-6 py-20 text-center flex flex-col items-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-sm font-semibold text-zinc-500">Accessing Secure Registry Database...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
