"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Rocket } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll-listener to toggle high-density blurred effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Programs", href: "/#programs" },
    { name: "Testimonials", href: "/testimonials" },
    { name: "Verify Credentials", href: "/verify" },
    { name: "Contact Us", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-panel py-3 shadow-md shadow-zinc-950/5 dark:shadow-black/20"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-12">
        {/* Brand Emblem */}
        <Link href="/" className="group flex items-center">
          <Image
            src="/logo.svg"
            alt="Sandevex Logo"
            width={127}
            height={40}
            className="h-8.5 w-auto transition-all duration-300 group-hover:scale-[1.02]"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-all duration-200 hover:text-brand-primary ${
                  active
                    ? "text-brand-primary dark:text-brand-secondary font-semibold"
                    : "text-zinc-600 dark:text-zinc-300"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden md:flex items-center">
          <Link
            href="/contact"
            className="group flex items-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-xs font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-brand-primary/25 hover:scale-[1.02]"
          >
            <Rocket className="h-4 w-4" />
            Join the Program
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 md:hidden"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 border-b border-zinc-200 bg-white/95 py-6 px-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden animate-scale-in">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-semibold transition-colors duration-200 ${
                    active
                      ? "text-brand-primary dark:text-brand-secondary"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3 text-center text-sm font-semibold text-white shadow-md hover:bg-brand-secondary transition"
              >
                <Rocket className="h-4.5 w-4.5" />
                Join the Program
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
