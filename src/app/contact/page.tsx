"use client";

import React, { useState } from "react";
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

export default function ContactPage() {
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "Student Skill Training",
    message: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [submitError, setSubmitError] = useState("");

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<string | null>("faq-1");

  const faqs: AccordionItem[] = [
    {
      id: "faq-1",
      question: "Are Sandevex certificates recognized by real companies?",
      answer: "Yes, absolutely! Sandevex is an official educational brand powered by Sand-Hut. All certifications are cryptographically stamped and registered in our public registry. Recruitment managers scan and verify credentials instantly, giving them 100% confidence in the authenticity of your learning and accomplishments.",
    },
    {
      id: "faq-2",
      question: "How does the guided internship phase operate?",
      answer: "Once you successfully complete the foundational training tracks with high performance (Grade A or above), you are automatically placed into our active internship program. You will collaborate on live developer repositories and product architectures under the supervision of senior engineers from Sand-Hut Labs.",
    },
    {
      id: "faq-3",
      question: "What is your support response guarantee (SLA)?",
      answer: "We take operations seriously. We hold a strict SLA commitment: every inquiry submitted through this validated contact portal is reviewed by a learning consultant, and a comprehensive response is delivered via email or call within 2 hours during active business cycles.",
    },
    {
      id: "faq-4",
      question: "Can colleges and universities request institutional batches?",
      answer: "Yes, we regularly partner with academic institutions across India. We offer specialized training tracks, customized curriculum configurations, and dedicated placement drives aligned directly with university credit requirements. Please select 'College & Academic Partnership' in the form.",
    },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^[0-9+\s-]{8,15}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (8-15 digits).";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error as the user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry");
      }

      setTicketId(data.ticketId);
      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        inquiryType: "Student Skill Training",
        message: "",
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (id: string) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  return (
    <div className="relative min-h-screen">
      
      {/* 1. SUCCESS OVERLAY MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-scale-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-2xl dark:border-zinc-800 dark:bg-[#0b111e]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Inquiry Dispatched Successfully!
            </h3>
            
            <p className="mt-4 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400">
              Ticket reference: {ticketId}
            </p>

            <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              We have received your ticket request. A Sandevex learning consultant has been assigned, and a confirmation log is arriving in your inbox. Under our SLA guidelines, we will contact you directly within <span className="font-bold text-brand-primary">2 hours</span>.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="rounded-xl bg-brand-primary px-5 py-3 text-xs font-semibold text-white hover:bg-brand-secondary transition"
              >
                Close Ticket Portal
              </button>
              <Link
                href="/"
                className="rounded-xl border border-zinc-300 px-5 py-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900 transition flex items-center justify-center gap-1"
              >
                Return Home <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. GENERAL CONTENT VIEW */}
      <div className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-10 lg:px-12">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-brand-primary transition">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>

        {/* Title Header */}
        <div className="text-left max-w-3xl mb-12">
          <span className="rounded-full bg-brand-primary/10 px-3.5 py-1.5 text-xs font-semibold text-brand-primary dark:text-brand-secondary">
            Global Operations Portal
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
            Get in touch with Sandevex Labs
          </h1>
          <p className="mt-4 text-sm sm:text-base leading-7 text-zinc-500 dark:text-zinc-400">
            Have questions about specialized curriculums, guided internship schedules, or corporate recruitment arrangements? Contact our team. We operate under active parent brand networks to assist you immediately.
          </p>
        </div>

        {/* Form and info panel splits */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start mb-20">
          
          {/* LEFT: Trust details and contacts */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Direct details card */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0b111e]">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Contact Desk
              </h3>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                Direct corporate communication channels.
              </p>

              <div className="mt-6 flex flex-col gap-5">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 leading-none">
                      Headquarters
                    </h4>
                    <p className="mt-1.5 text-xs text-zinc-500 leading-5">
                      Sand-Hut & Sandevex Technology Center,<br />
                      Nelamangala Rd, Kadabagere Cross,<br />
                      Kadabagere, Bengaluru, Karnataka 562130
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Mail className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 leading-none">
                      Support Email
                    </h4>
                    <a
                      href="mailto:contact@sandhut.in"
                      className="mt-1.5 text-xs font-semibold text-brand-primary hover:underline block"
                    >
                      contact@sandhut.in
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Phone className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 leading-none">
                      Corporate Phone
                    </h4>
                    <a
                      href="tel:+917353119393"
                      className="mt-1.5 text-xs font-semibold text-brand-primary hover:underline block"
                    >
                      +91-7353119393
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Support SLA card */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#0b111e]">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-accent animate-pulse-slow" /> Support Guarantee
              </h3>
              <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Sandevex operations are backed by robust corporate structures. All inquiries submitted via this dashboard generate an active registry ticket logged directly into our CRM queue. We guarantee a detailed resolution response in under <span className="font-bold text-zinc-900 dark:text-white">2 hours</span>.
              </p>
              
              <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-900 flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                ISO 9001:2015 Approved Workflows
              </div>
            </div>

          </div>

          {/* RIGHT: Form dispatch panel */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-[#0b111e]">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                Submit Inquiry Ticket
              </h3>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                Fields marked with * are strictly required.
              </p>

              {submitError && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full rounded-xl border py-3 px-4 text-xs font-semibold focus:outline-none dark:bg-zinc-950 dark:text-white ${
                      errors.name ? "border-red-500" : "border-zinc-200 dark:border-zinc-800 focus:border-brand-primary"
                    }`}
                  />
                  {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Email and Phone Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. name@domain.com"
                      className={`w-full rounded-xl border py-3 px-4 text-xs font-semibold focus:outline-none dark:bg-zinc-950 dark:text-white ${
                        errors.email ? "border-red-500" : "border-zinc-200 dark:border-zinc-800 focus:border-brand-primary"
                      }`}
                    />
                    {errors.email && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 98765 43210"
                      className={`w-full rounded-xl border py-3 px-4 text-xs font-semibold focus:outline-none dark:bg-zinc-950 dark:text-white ${
                        errors.phone ? "border-red-500" : "border-zinc-200 dark:border-zinc-800 focus:border-brand-primary"
                      }`}
                    />
                    {errors.phone && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                {/* Inquiry Type */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Inquiry Type *
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-zinc-200 py-3 px-4 text-xs font-semibold focus:border-brand-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option>Student Skill Training</option>
                    <option>Guided Internship Track</option>
                    <option>College & Academic Partnership</option>
                    <option>Corporate Hiring & Placements</option>
                    <option>Certificate Verification Inquiry</option>
                    <option>Other Operational Request</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Message Detail *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Provide details about your query or academic credentials request..."
                    className={`w-full rounded-xl border py-3 px-4 text-xs font-semibold focus:outline-none dark:bg-zinc-950 dark:text-white ${
                      errors.message ? "border-red-500" : "border-zinc-200 dark:border-zinc-800 focus:border-brand-primary"
                    }`}
                  />
                  {errors.message && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.message}</p>}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3.5 text-xs font-bold text-white shadow-md hover:scale-[1.01] transition disabled:opacity-75"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" /> Logging Ticket to CRM...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Dispatch Verified Inquiry
                    </>
                  )}
                </button>

              </form>
            </div>
          </div>

        </div>

        {/* 3. INTERACTIVE FAQ ACCORDION SECTION */}
        <section id="faq" className="max-w-4xl mx-auto pt-10 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary mb-3">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Clear corporate answers regarding Sandevex standards, placement operations, and certificate safety.
            </p>
          </div>

          {/* Collapsible item loops */}
          <div className="flex flex-col gap-3">
            {faqs.map((faq) => {
              const isOpen = activeFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#0b111e] overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="flex w-full items-center justify-between py-4 px-5 text-left font-bold text-sm text-zinc-900 hover:text-brand-primary dark:text-white transition"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-brand-primary shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0 ml-4" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs leading-6 text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-900 animate-scale-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
