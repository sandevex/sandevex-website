import { adminDb } from "@/lib/firebase-admin";
import {
  Award,
  CheckCircle,
  ArrowLeft,
  Share2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import DownloadCertificateClientButton from "@/components/DownloadCertificateClientButton";

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

// Dynamic metadata for SEO and social sharing
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const cleanId = id.trim().toUpperCase();

  try {
    const snapshot = await adminDb
      .collection("credentials")
      .where("id", "==", cleanId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data() as Certificate;
      return {
        title: `${data.name} — ${data.type}`,
        description: `Verified Sandevex credential for ${data.name}. ${data.course} — ${data.grade}. Issued on ${data.issueDate}. Powered by Sand-Hut Tech Solutions.`,
        openGraph: {
          title: `${data.name} — Sandevex Verified Credential`,
          description: `${data.course} — ${data.grade}. Verified by Sand-Hut Secure Registry.`,
          type: "profile",
        },
      };
    }
  } catch {
    // fallback
  }

  return {
    title: "Credential Not Found",
    description: "The requested credential could not be found in the Sandevex registry.",
  };
}

export default async function CredentialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cleanId = id.trim().toUpperCase();

  let credential: Certificate | null = null;

  try {
    const snapshot = await adminDb
      .collection("credentials")
      .where("id", "==", cleanId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      credential = snapshot.docs[0].data() as Certificate;
    }
  } catch {
    credential = null;
  }

  if (!credential) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mx-auto mb-6">
          <Award className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white">
          Credential Not Found
        </h1>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
          We could not find a credential with ID <span className="font-mono font-bold text-red-500">&ldquo;{cleanId}&rdquo;</span> in our registry.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/verify"
            className="rounded-xl bg-brand-primary px-5 py-3 text-xs font-semibold text-white hover:bg-brand-secondary transition"
          >
            Try Verification Portal
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-zinc-300 px-5 py-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900 transition"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10 sm:px-10 lg:px-12">
      {/* Nav back */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-brand-primary transition">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>

      {/* Verified Badge Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            Registry Verified & {credential.status}
          </span>
        </div>
      </div>

      {/* Premium Certificate Display */}
      <div className="relative rounded-3xl border-2 border-amber-500/30 bg-white p-8 sm:p-12 shadow-2xl dark:bg-[#070b13] overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute right-0 top-0 -translate-y-16 translate-x-16 h-64 w-64 rounded-full bg-amber-500/8 blur-3xl"></div>
        <div className="absolute left-0 bottom-0 translate-y-16 -translate-x-16 h-64 w-64 rounded-full bg-emerald-500/8 blur-3xl"></div>
        
        {/* Inner border */}
        <div className="absolute inset-5 rounded-2xl border border-amber-500/15 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Emblem */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 border-2 border-amber-500/20 mb-8">
            <Award className="h-11 w-11 text-amber-500" />
          </div>

          <p className="text-[10px] tracking-[0.3em] font-bold text-zinc-400 uppercase dark:text-zinc-500">
            Sandevex Verified Credentials Registry
          </p>

          <h1 className="mt-5 text-3xl sm:text-4xl font-serif font-semibold text-zinc-900 dark:text-white">
            Certificate of Competency
          </h1>

          <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed italic max-w-lg">
            This document certifies that the following candidate has completed all required training modules, coding assignments, and guided internships under real tech environment standards.
          </p>

          {/* Name */}
          <div className="mt-10 flex flex-col items-center">
            <span className="text-[11px] font-bold text-brand-primary dark:text-brand-secondary uppercase tracking-widest">
              Candidate Name
            </span>
            <span className="mt-3 text-3xl font-bold text-zinc-900 dark:text-white">
              {credential.name}
            </span>
          </div>

          {/* Course */}
          <div className="mt-6 flex flex-col items-center">
            <span className="text-[11px] font-bold text-brand-primary dark:text-brand-secondary uppercase tracking-widest">
              Course Path
            </span>
            <span className="mt-2 text-base font-semibold text-zinc-800 dark:text-zinc-200">
              {credential.course}
            </span>
          </div>

          {/* Details Grid */}
          <div className="mt-10 grid grid-cols-3 gap-6 border-y border-zinc-100 py-6 dark:border-zinc-900 w-full max-w-lg">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Grade</span>
              <p className="mt-1.5 text-sm font-bold text-zinc-800 dark:text-zinc-200">{credential.grade}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Issued</span>
              <p className="mt-1.5 text-sm font-bold text-zinc-800 dark:text-zinc-200">{credential.issueDate}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Type</span>
              <p className="mt-1.5 text-sm font-bold text-zinc-800 dark:text-zinc-200">{credential.type}</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-8 w-full max-w-lg">
            <div className="flex flex-col items-center">
              <span className="text-sm font-serif italic text-zinc-500 dark:text-zinc-400 font-semibold">
                {credential.issuer.split(" in ")[0]}
              </span>
              <div className="h-px w-32 bg-zinc-200 dark:bg-zinc-800 my-2"></div>
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Director Signature
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  Registry Verified
                </span>
              </div>
              <span className="text-[8px] font-semibold text-zinc-400 dark:text-zinc-500">
                Serial: {credential.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <DownloadCertificateClientButton credential={credential} />
        
        <Link
          href={`/verify?id=${credential.id}`}
          className="flex items-center gap-2 rounded-xl border border-zinc-300 px-5 py-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900 transition"
        >
          <ExternalLink className="h-4 w-4" /> Verify in Registry Portal
        </Link>
        <Link
          href="/contact"
          className="flex items-center gap-2 rounded-xl border border-zinc-300 px-5 py-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900 transition"
        >
          <Share2 className="h-4 w-4" /> Contact Issuing Authority
        </Link>
      </div>

      {/* Trust Footer */}
      <div className="mt-12 text-center text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">
        <span>Powered by Sand-Hut Tech Solutions</span>
        <span className="mx-2">•</span>
        <span>ISO 9001:2015 Approved</span>
      </div>
    </div>
  );
}
