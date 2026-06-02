"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Send,
  Loader2,
  CheckCircle,
  MessageSquare,
  ArrowRight,
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

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [formData, setFormData] = useState({
    author: "",
    role: "",
    course: "Fullstack Web Engineering",
    quote: "",
    stars: 5,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      if (data.testimonials) {
        setTestimonials(data.testimonials);
      }
    } catch {
      console.error("Failed to fetch testimonials");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.author || !formData.role || !formData.quote) {
      showToast("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, approved: false }),
      });

      if (res.ok) {
        setShowSuccess(true);
        setShowForm(false);
        setFormData({
          author: "",
          role: "",
          course: "Fullstack Web Engineering",
          quote: "",
          stars: 5,
        });
      } else {
        showToast("Failed to submit. Please try again.");
      }
    } catch {
      showToast("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 rounded-xl bg-zinc-900 px-5 py-3 text-xs font-semibold text-white shadow-2xl flex items-center gap-2 animate-scale-in">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-brand-primary transition">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-3.5 py-1.5 text-xs font-semibold text-brand-primary dark:text-brand-secondary mb-4">
              <MessageSquare className="h-4 w-4" /> Graduate Voices
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
              Validated by Real Graduates
            </h1>
            <p className="mt-4 text-sm sm:text-base leading-7 text-zinc-500 dark:text-zinc-400">
              Hear directly from our alumni about how Sandevex transformed their practical skills and launched their careers in tech.
            </p>
          </div>

          <button
            onClick={() => { setShowForm(!showForm); setShowSuccess(false); }}
            className="shrink-0 flex items-center gap-2 rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:scale-[1.02] transition glow-accent"
          >
            <Send className="h-4 w-4" />
            Share Your Story
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-10 rounded-3xl border-2 border-emerald-500/20 bg-emerald-50/50 p-6 flex items-start gap-4 animate-fade-in-up dark:bg-emerald-950/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white">Thank you for sharing!</h3>
              <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Your testimonial has been submitted and is pending review by our team. Once approved, it will appear on this page and the homepage.
              </p>
            </div>
          </div>
        )}

        {/* Submit Testimonial Form */}
        {showForm && (
          <div className="mb-12 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-[#0b111e] animate-fade-in-up">
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Share Your Sandevex Experience</h3>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Your testimonial will be reviewed before publishing.</p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData(p => ({ ...p, author: e.target.value }))}
                    placeholder="e.g. Aditya Hegde"
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-xs font-semibold focus:border-brand-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Current Role *</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                    placeholder="e.g. Frontend Developer at DevDynamics"
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-xs font-semibold focus:border-brand-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Course Completed *</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData(p => ({ ...p, course: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-xs font-semibold focus:border-brand-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option>Fullstack Web Engineering</option>
                    <option>Frontend Engineering & Systems</option>
                    <option>UI/UX & Product Design</option>
                    <option>Systems & Database Architecture</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Rating</label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, stars: s }))}
                        className="transition hover:scale-110"
                      >
                        <Star className={`h-6 w-6 ${s <= formData.stars ? "text-amber-500 fill-current" : "text-zinc-300 dark:text-zinc-700"}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">Your Experience *</label>
                <textarea
                  value={formData.quote}
                  onChange={(e) => setFormData(p => ({ ...p, quote: e.target.value }))}
                  rows={4}
                  placeholder="Share how Sandevex helped you grow professionally..."
                  className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-xs font-semibold focus:border-brand-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3.5 text-xs font-bold text-white shadow-md hover:scale-[1.01] transition disabled:opacity-75"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="h-4 w-4" /> Submit Testimonial</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Testimonials Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin h-10 w-10 border-4 border-brand-primary border-t-transparent rounded-full mb-4"></div>
            <p className="text-sm font-semibold text-zinc-500">Loading graduate testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">No testimonials yet</h3>
            <p className="mt-2 text-sm text-zinc-500">Be the first graduate to share your experience!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.docId}
                className="flex flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div>
                  <div className="flex gap-1 text-amber-500 mb-4">
                    {[...Array(t.stars)].map((_, i) => (
                      <Star key={i} className="h-4.5 w-4.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-300 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-900 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-white text-xs font-bold uppercase">
                    {t.author.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white leading-none">
                      {t.author}
                    </h4>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-none">
                      {t.role}
                    </p>
                    <p className="text-[9px] text-brand-primary dark:text-brand-secondary mt-1 font-semibold leading-none">
                      {t.course}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Banner */}
        <div className="mt-16 rounded-[2rem] bg-gradient-brand px-6 py-12 text-white text-center relative overflow-hidden">
          <div className="absolute right-0 top-0 -translate-y-8 translate-x-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute left-0 bottom-0 translate-y-8 -translate-x-8 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to Write Your Success Story?
            </h2>
            <p className="mt-4 text-sm text-white/80 max-w-xl mx-auto">
              Join thousands of graduates who transformed their careers through practical, industry-grade training.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-brand-primary hover:bg-zinc-100 transition shadow-md"
            >
              Inquire & Apply Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
