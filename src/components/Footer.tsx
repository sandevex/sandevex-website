"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-[#070b13] text-zinc-600 dark:text-zinc-400">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="group flex items-center">
              <Image
                src="/logo.svg"
                alt="Sandevex Logo"
                width={119}
                height={38}
                className="h-7.5 w-auto transition-all duration-300 group-hover:scale-[1.02]"
              />
            </Link>
            <p className="text-sm leading-6 max-w-sm text-zinc-500 dark:text-zinc-400">
              India’s next-gen ecosystem for practical skill training, professional development, and guided internships. Bridging the gap between university education and real industry requirements.
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                ISO 9001:2015 Process Compliant
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Sand-Hut Secure Credentials System
              </div>
            </div>
          </div>

          {/* Programs Links */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-sm font-semibold tracking-wider text-zinc-900 dark:text-zinc-200 uppercase">
              Core Programs
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/#programs" className="hover:text-brand-primary transition">
                  Fullstack Web Engineering
                </Link>
              </li>
              <li>
                <Link href="/#programs" className="hover:text-brand-primary transition">
                  Frontend Development
                </Link>
              </li>
              <li>
                <Link href="/#programs" className="hover:text-brand-primary transition">
                  UI/UX & Product Design
                </Link>
              </li>
              <li>
                <Link href="/#programs" className="hover:text-brand-primary transition">
                  Systems & Database Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-sm font-semibold tracking-wider text-zinc-900 dark:text-zinc-200 uppercase">
              Corporate Trust
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link href="/verify" className="hover:text-brand-primary transition font-medium text-brand-primary dark:text-brand-secondary">
                  Credentials Registry
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-primary transition">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-brand-primary transition">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <a href="https://sandhut.in" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition">
                  Sand-Hut Parent Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Corporate Headquarters Contact */}
          <div className="flex flex-col gap-3.5">
            <h4 className="text-sm font-semibold tracking-wider text-zinc-900 dark:text-zinc-200 uppercase">
              Headquarters
            </h4>
            <ul className="flex flex-col gap-3.5 text-sm">
              <li className="flex gap-2">
                <MapPin className="h-5 w-5 shrink-0 text-brand-primary" />
                <span className="leading-5 text-zinc-500">
                  Sand-Hut & Sandevex Labs,<br />
                  Nelamangala Rd, Kadabagere Cross,<br />
                  Kadabagere, Bengaluru, Karnataka 562130
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4.5 w-4.5 text-brand-primary" />
                <a href="mailto:contact@sandhut.in" className="hover:text-brand-primary transition">
                  contact@sandhut.in
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4.5 w-4.5 text-brand-primary" />
                <a href="tel:+917353119393" className="hover:text-brand-primary transition">
                  +91-7353119393
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with socials and copyrights */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
            © {currentYear} Sandevex. All rights reserved. Sandevex, logos, and certifications are registered trademarks of{" "}
            <a href="https://sandhut.in" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-primary">
              Sand-Hut
            </a>.
          </p>

          <div className="flex items-center gap-5">
            <a
              href="https://www.linkedin.com/company/sandevex"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sandevex LinkedIn"
              className="text-zinc-400 hover:text-brand-primary dark:hover:text-brand-secondary transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/sandevex"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sandevex Instagram"
              className="text-zinc-400 hover:text-brand-primary dark:hover:text-brand-secondary transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sandevex GitHub"
              className="text-zinc-400 hover:text-brand-primary dark:hover:text-brand-secondary transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
