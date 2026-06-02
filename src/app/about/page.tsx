import React from "react";
import Link from "next/link";
import {
  Rocket,
  Sparkles,
  ShieldCheck,
  Building,
  Code,
  ArrowRight,
  HeartHandshake,
} from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      title: "Real Production Habitation",
      description: "College teaches you syntax. We teach you habits. You will configure actual databases, submit pull requests, resolve merge conflicts, and deploy microservices on public servers.",
      icon: <Code className="h-6 w-6 text-brand-primary" />,
    },
    {
      title: "Corporate Backed Pedigree",
      description: "Sandevex isn't a speculative educational startup. We are backed directly by Sand-Hut Tech Solutions, an established engineering agency in Bengaluru. Your curriculum is designed by developers who write commercial systems daily.",
      icon: <Building className="h-6 w-6 text-indigo-500" />,
    },
    {
      title: "Guided Internship Funnels",
      description: "Your ultimate goal is resume validation. We offer direct transition pipelines. High-performing cohort graduates are placed in guided software internships inside Sand-Hut or partner enterprise divisions.",
      icon: <Rocket className="h-6 w-6 text-brand-primary" />,
    },
    {
      title: "Active Dev-Peer Mentorship",
      description: "No intimidating professors grading on memorization. Our mentors are friendly senior tech leads who speak your language, audit your schemas, review your UI margins, and guide your growth as engineering peers.",
      icon: <HeartHandshake className="h-6 w-6 text-emerald-500" />,
    },
  ];

  const milestones = [
    {
      year: "The Spark",
      title: "Frustrated with College Theory",
      desc: "Our founders, while studying software engineering in college, realized they spent years memorizing database syntax on physical paper while having no idea how to host a live server or manage actual repositories.",
    },
    {
      year: "The Partnership",
      title: "Sand-Hut Support",
      desc: "To solve this systemic educational gap, we partnered with Sand-Hut Tech Solutions in Bengaluru to establish an ecosystem where students train under authentic company workflows and tools.",
    },
    {
      year: "Today & Beyond",
      title: "India’s Next Builders",
      desc: "Over 5,000 youngsters have trained through our cohorts, graduating with secure verified credentials, solid developer profiles, and direct internship placements in modern tech workspaces.",
    },
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">
      
      {/* 1. HERO HEADER */}
      <section className="relative w-full pt-16 pb-20 border-b border-zinc-200 dark:border-zinc-800 bg-radial from-brand-primary/5 via-transparent to-transparent">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center">
            
            <div className="mb-6 flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-600">
              <Sparkles className="h-4.5 w-4.5 text-brand-primary" />
              <span>We build what we wish we had in college</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-5xl lg:text-6xl leading-tight">
              Antidote to <span className="text-gradient-brand">Passive Learning</span>
            </h1>

            <p className="mt-6 text-base leading-8 text-zinc-500 dark:text-zinc-400 sm:text-lg max-w-2xl">
              We are a team of software developers and product designers on a mission. We build high-trust pathways for youngsters to transition seamlessly from rote classroom theory into elite company standard talent.
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                href="/#programs"
                className="rounded-full bg-gradient-brand px-6 py-3.5 text-xs font-bold text-white shadow-lg transition hover:scale-[1.01]"
              >
                Join a Program Cohort
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-zinc-300 px-6 py-3.5 text-xs font-bold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900 transition"
              >
                Connect With Us
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 2. THE STUDENT MINDSET SECTION */}
      <section className="py-20 bg-section-alt border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
          
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            
            <div className="flex flex-col items-start">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-primary">
                The Student Dilemma
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                Tired of writing code on paper? We understand.
              </h2>
              <p className="mt-6 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
                Let&apos;s be completely honest: college curriculum forces you to memorize dry concepts to pass semester exams, leaving you completely unprepared for actual software jobs. 
              </p>
              <p className="mt-4 text-sm leading-7 text-zinc-500 dark:text-zinc-400">
                When you apply for internships, recruitment teams don&apos;t look at your theoretical GPA sheet. They look at your GitHub profile, your UI design details, your database deployments, and your active credentials. 
              </p>
              
              <div className="mt-8 rounded-2xl border border-brand-primary/10 bg-brand-primary/5 p-5 flex gap-3 max-w-lg">
                <ShieldCheck className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
                <div className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                  <span className="font-bold text-zinc-950 dark:text-white block mb-1">
                    Sandevex SLA Guarantee
                  </span>
                  We don&apos;t sell boring pre-recorded slide packs. Every learner undergoes interactive repository code reviews, active mentorship check-ins, and receives a secure, verified resume stamp.
                </div>
              </div>
            </div>

            {/* Glowing custom graphics dashboard */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-primary to-indigo-500 opacity-20 blur-xl"></div>
              
              <div className="relative rounded-3xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950/80">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Active Developer Funnel
                </span>
                
                <div className="mt-6 flex flex-col gap-5">
                  {[
                    { title: "Standard College Route", desc: "Passive memorization ➔ Code written on paper ➔ Empty portfolio ➔ Resume rejection", color: "border-red-500/30 bg-red-500/5 text-red-650" },
                    { title: "The Sandevex Ecosystem", desc: "Active Next.js development ➔ Secure schema hosting ➔ Verified Sand-Hut internship ➔ Direct hire", color: "border-brand-primary/30 bg-brand-primary/5 text-brand-primary" }
                  ].map((route, i) => (
                    <div key={i} className={`rounded-2xl border p-5 ${route.color}`}>
                      <h4 className="font-bold text-sm tracking-tight">{route.title}</h4>
                      <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{route.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. OUR VALUE PILLARS */}
      <section className="py-20 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-primary">
              Core Principles
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
              Engineered for Student Success
            </h2>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              We design all workflows around practical engineering habits, corporate trust compliance, and career placements.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((val) => (
              <div
                key={val.title}
                className="flex flex-col items-start rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 transition hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm mb-5">
                  {val.icon}
                </div>
                <h3 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
                  {val.title}
                </h3>
                <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400 flex-1">
                  {val.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. THE SANDEVEX STORY (TIMELINE) */}
      <section className="py-20 bg-section-alt border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-primary">
              Our Journey
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
              From Frustrated Students to Industry Guides
            </h2>
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              Sandevex was forged by developers who wanted to fix traditional engineering education for the next generation of builders.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto flex flex-col gap-8">
            {/* Center line for large screen */}
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-zinc-200 dark:bg-zinc-800 md:left-1/2 md:-translate-x-1/2"></div>
            
            {milestones.map((m, idx) => (
              <div key={idx} className="relative flex flex-col md:flex-row md:justify-between items-start gap-4">
                
                {/* Visual marker dot */}
                <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary text-white text-[10px] font-bold shadow-sm z-10 border-4 border-white dark:border-zinc-950">
                </div>

                <div className={`pl-12 md:pl-0 w-full md:w-[45%] ${idx % 2 === 0 ? "md:text-right" : "md:order-last md:text-left"}`}>
                  <span className="text-xs font-extrabold text-brand-primary block tracking-wider uppercase">
                    {m.year}
                  </span>
                  <h4 className="mt-2 text-lg font-bold tracking-tight text-zinc-950 dark:text-white leading-none">
                    {m.title}
                  </h4>
                  <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                    {m.desc}
                  </p>
                </div>

                {/* Empty spacer spacer on md screens */}
                <div className="hidden md:block w-[45%]"></div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. BRAND CTA */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10 lg:px-12">
        <div className="relative rounded-[2rem] bg-zinc-950 px-6 py-16 text-white dark:bg-white dark:text-zinc-950 sm:px-12 md:py-20 overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 h-64 w-64 rounded-full bg-brand-primary/20 dark:bg-brand-primary/10 blur-3xl"></div>
          
          <div className="relative z-10 max-w-3xl flex flex-col items-start">
            <span className="rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold tracking-wide uppercase dark:bg-zinc-950/10">
              Join The Cohorts
            </span>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight">
              Ready to build like an actual engineer?
            </h2>
            <p className="mt-6 text-sm sm:text-base leading-7 text-zinc-300 dark:text-zinc-600">
              Apply today to secure a seat in our upcoming cohorts. Break free from classroom slides, write high-fidelity features, and secure a verifiable professional internship through our Bangalore engineering divisions.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-white px-7 py-4 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100 hover:scale-[1.02] dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900"
              >
                Enroll & Contact Us
              </Link>
              <Link
                href="/#programs"
                className="rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/10 dark:border-zinc-950/20 dark:text-zinc-950 dark:hover:bg-zinc-950/10 flex items-center gap-1.5"
              >
                View Learning Paths <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
