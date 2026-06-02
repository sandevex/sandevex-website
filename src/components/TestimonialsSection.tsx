"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";

interface Testimonial {
  docId: string;
  quote: string;
  author: string;
  role: string;
  course: string;
  stars: number;
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (data.testimonials) {
          // Show max 3 on homepage
          setTestimonials(data.testimonials.slice(0, 3));
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div className="max-w-2xl text-left">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-primary dark:text-brand-secondary">
              Success Stories
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
              Validated by Real Graduates
            </h2>
            <p className="mt-4 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Listen to how youngsters converted their practical curriculum into professional engineering roles.
            </p>
          </div>
          <Link
            href="/testimonials"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary dark:text-brand-secondary hover:underline"
          >
            View All Stories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
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
      </div>
    </section>
  );
}
