import React from "react";
import Link from "next/link";
import {
  Award,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle,
  ShieldCheck,
  Users,
  Code,
  Globe,
  Settings,
  Sparkles,
} from "lucide-react";
import TestimonialsSection from "@/components/TestimonialsSection";
import { adminDb } from "@/lib/firebase-admin";

export default async function Home() {
  const stats = [
    {
      id: "stat-1",
      icon: <Users className="h-6 w-6 text-brand-primary dark:text-brand-secondary" />,
      value: "5,000+",
      label: "Active Learners",
      description: "Youngsters building real skills.",
    },
    {
      id: "stat-2",
      icon: <Briefcase className="h-6 w-6 text-brand-accent" />,
      value: "150+",
      label: "Hiring Partners",
      description: "Top-tier companies hiring graduates.",
    },
    {
      id: "stat-3",
      icon: <CheckCircle className="h-6 w-6 text-indigo-500" />,
      value: "98%",
      label: "Completion Rate",
      description: "Unmatched guided support.",
    },
    {
      id: "stat-4",
      icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
      value: "100%",
      label: "Verified Credentials",
      description: "Secure, tamper-proof certificates.",
    },
  ];

  // Helper to map icons dynamically based on program name
  const getProgramIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("fullstack")) return <Code className="h-7 w-7 text-brand-primary" />;
    if (n.includes("frontend")) return <Globe className="h-7 w-7 text-indigo-500" />;
    if (n.includes("design") || n.includes("ui/ux")) return <Sparkles className="h-7 w-7 text-brand-accent" />;
    return <Settings className="h-7 w-7 text-emerald-500" />;
  };

  let learningTracks = [];
  try {
    const programsSnapshot = await adminDb
      .collection("programs")
      .where("status", "==", "Active")
      .get();
    
    learningTracks = programsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        title: data.name,
        duration: data.duration || "12 Weeks",
        level: data.level || "All Levels Welcome",
        description: data.description || "",
        icon: getProgramIcon(data.name),
        syllabus: data.skills || [],
        badge: data.badge || "Learning Track",
      };
    });
  } catch (err) {
    console.error("Firestore programs fetch failed, falling back to static roster:", err);
    learningTracks = [
      {
        title: "Fullstack Web Engineering",
        duration: "16 Weeks",
        level: "Intermediate to Advanced",
        description:
          "Build complex web systems from database design to frontend optimization. Master Next.js, Postgres, Redis, and high-throughput server architecture.",
        icon: <Code className="h-7 w-7 text-brand-primary" />,
        syllabus: ["Next.js & React Server Components", "Postgres, Prisma & Database Tuning", "RESTful & GraphQL API Design", "Docker & Cloud Deployment Basics"],
        badge: "Placement Linked",
      },
      {
        title: "Frontend Engineering & Systems",
        duration: "12 Weeks",
        level: "Beginner to Intermediate",
        description:
          "Develop ultra-responsive, beautiful web interfaces. Master design patterns, performance optimizations, state management, and modern CSS/Tailwind engines.",
        icon: <Globe className="h-7 w-7 text-indigo-500" />,
        syllabus: ["Modern ES6+ & TypeScript Essentials", "React & Component Design Patterns", "Tailwind CSS v4 & Motion Engines", "Web Vitals & Performance Auditing"],
        badge: "Most Popular",
      },
      {
        title: "UI/UX & Product Design",
        duration: "10 Weeks",
        level: "All Levels Welcome",
        description:
          "Design gorgeous, highly conversion-optimized digital products. Work on user research, responsive layouts, prototyping, and developer handoffs.",
        icon: <Sparkles className="h-7 w-7 text-brand-accent" />,
        syllabus: ["Design Systems & Style Guides", "Figma High-Fidelity Prototyping", "User Research & Interaction Models", "A/B Testing & Product Metrics"],
        badge: "Creative Hub",
      },
      {
        title: "Systems & Database Architecture",
        duration: "14 Weeks",
        level: "Advanced Track",
        description:
          "Gain deeper architectural command. Master scalability, caching hierarchies, database shards, microservices, and reliable server-to-server operations.",
        icon: <Settings className="h-7 w-7 text-emerald-500" />,
        syllabus: ["Microservices Architecture & REST", "Redis Caching & Queue Management", "DB Sharding & Horizontal Scaling", "CI/CD Pipelines & Secure Access"],
        badge: "Specialized Track",
      },
    ];
  }

  const corePillars = [
    {
      title: "Project-Centric Learning",
      description:
        "No mindless tutorials. You write production-grade code, deploy database schemas, design interfaces, and build portfolio assets that stand out to recruiters.",
    },
    {
      title: "Backed by Sand-Hut Ecosystem",
      description:
        "Benefit from the authority of Sand-Hut, our parent technology brand. Gain industry-accepted validation, authentic workflows, and premium resources.",
    },
    {
      title: "Structured Mentorship",
      description:
        "Our industry mentors don't just teach—they review your pull requests, audit your design files, and hold rigorous mock interviews to test your confidence.",
    },
    {
      title: "Direct Corporate Placement",
      description:
        "Connect with a growing network of tech organizations. Sandevex graduates gain priority matching and fast-tracked hiring processes.",
    },
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-zinc-200 dark:border-zinc-800 bg-radial from-brand-primary/5 via-transparent to-transparent">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            
            <div className="flex flex-col items-start text-left">
              {/* Trust Badge */}
              <div className="mb-6 flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-xs font-semibold text-zinc-650 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                <ShieldCheck className="h-4.5 w-4.5 text-[#18cb96]" />
                <span>Powered by Sand-Hut Tech Solutions</span>
              </div>

              {/* Catchy Premium Title */}
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.15] max-w-4xl leading-tight">
                Stop Writing Code on Paper.<br />
                <span className="text-gradient-brand">Start Deploying Live Systems.</span>
              </h1>

              {/* Sub-description */}
              <p className="mt-6 text-base leading-8 text-zinc-600 dark:text-zinc-400 max-w-2xl sm:text-lg">
                Traditional college degrees force you to memorize dry concepts for semester exams. Sandevex is different. Backed by **Sand-Hut**, we guide college students and young professionals to build production-grade software, host databases, deploy active servers, and secure cryptographic professional credentials that recruiters actually trust.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap gap-4 items-center">
                <Link
                  href="/contact"
                  className="group flex items-center gap-2 rounded-full bg-gradient-brand px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-all duration-300 hover:shadow-brand-primary/30 hover:scale-[1.02] glow-accent"
                >
                  <BookOpen className="h-4.5 w-4.5" />
                  Join the Program
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/#programs"
                  className="group flex items-center gap-2 rounded-full border border-zinc-300 px-7 py-4 text-sm font-semibold text-zinc-900 transition-all duration-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-900"
                >
                  Explore Learning Tracks
                </Link>
              </div>
            </div>

            {/* Quick Promo Side widget */}
            <div className="relative flex flex-col gap-6">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-primary to-emerald-500 opacity-20 blur-xl"></div>
              
              <div className="relative rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950/80">
                <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary dark:text-brand-secondary">
                  Credential Security
                </span>
                <h3 className="mt-4 text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  Cryptographic Verification
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Every Sandevex certificate is locked with an immutable serial key registered under Sand-Hut systems. Recruiters verify talent authentication instantly.
                </p>
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <Link
                    href="/verify"
                    className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary dark:text-brand-secondary hover:underline"
                  >
                    Test live registry lookup <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="relative rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950/80">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Placement Support
                </span>
                <h3 className="mt-4 text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  Guided Internships
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Top performing students receive direct placements within Sand-Hut labs, internal projects, and client tech teams.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATS GRID SECTION */}
      <section className="py-12 bg-section-alt border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="flex flex-col items-start rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 transition hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  {stat.icon}
                </div>
                <p className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {stat.label}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE PROGRAMS SECTION */}
      <section id="programs" className="py-20 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
          
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-primary dark:text-brand-secondary">
                Curriculum Excellence
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                Industry-Grade Learning Tracks
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-7 text-zinc-500 dark:text-zinc-400">
                Forget passive lecture slides. Master modern architectures by building production networks under real corporate guidance.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-primary dark:text-brand-secondary hover:underline"
              >
                Inquire about custom batch requests <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {learningTracks.map((track) => (
              <div
                key={track.title}
                className="group relative flex flex-col rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 transition-all duration-300 hover:shadow-lg hover:border-brand-primary/40 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                    {track.icon}
                  </div>
                  <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary dark:text-brand-secondary">
                    {track.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  {track.title}
                </h3>

                <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  <span>Duration: {track.duration}</span>
                  <span>•</span>
                  <span>Level: {track.level}</span>
                </div>

                <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400 flex-1">
                  {track.description}
                </p>

                {/* Micro syllabus lists */}
                <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-900">
                  <p className="text-xs font-bold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
                    Skills & Architecture:
                  </p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {track.syllabus.map((item: string) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <Link
                    href="/contact"
                    className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-zinc-100 py-3 text-center text-xs font-semibold text-zinc-950 transition hover:bg-brand-primary hover:text-white"
                  >
                    Apply for this Track <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECURITY & VERIFICATION CORE BANNER */}
      <section className="py-16 bg-gradient-brand text-white relative overflow-hidden">
        {/* Glow decorative backdrop */}
        <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 h-64 w-64 rounded-full bg-emerald-400/25 blur-3xl"></div>
        <div className="absolute left-0 bottom-0 translate-y-12 -translate-x-12 h-64 w-64 rounded-full bg-blue-500/25 blur-3xl"></div>

        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12 relative z-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold w-fit tracking-wide">
                <Award className="h-4 w-4" />
                VERIFIED CREDENTIAL REGISTRY
              </div>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight">
                Authentic, Digital Credentials That Accelerate Careers
              </h2>
              <p className="mt-6 text-sm sm:text-base leading-7 text-white/80 max-w-2xl">
                Every graduate is recorded in our publicly queryable Secure Registry portal. Companies and universities verify certificate status instantly without slow manual background checking. Build corporate confidence instantly.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/verify"
                  className="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-brand-primary transition hover:bg-zinc-100 hover:scale-[1.02] shadow-md"
                >
                  Verify a Certificate ID
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-white/30 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Corporate Partners API
                </Link>
              </div>
            </div>

            {/* Simulated mini search lookup console */}
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-md">
              <h3 className="text-lg font-bold tracking-tight">Registry Quick Check</h3>
              <p className="mt-1 text-xs text-white/70">
                See how recruiters experience certificate authentication.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <div className="flex gap-2">
                  <div className="flex-1 rounded-xl bg-white/10 px-3.5 py-2.5 text-xs font-mono text-white/95 placeholder-white/40 border border-white/10">
                    SE-2026-F8A2
                  </div>
                  <Link
                    href="/verify?id=SE-2026-F8A2"
                    className="flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-brand-primary hover:bg-zinc-100"
                  >
                    Validate
                  </Link>
                </div>
                <div className="text-[10px] text-white/50 leading-relaxed">
                  * Try looking up candidate registry key `SE-2026-F8A2` to see active credentials.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY US & TRUST PILLARS */}
      <section className="py-20 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
          <div className="max-w-2xl text-left">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-primary dark:text-brand-secondary">
              The Sandevex Advantage
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
              Why Top Youngsters Choose Sandevex
            </h2>
            <p className="mt-4 text-sm sm:text-base leading-7 text-zinc-500 dark:text-zinc-400">
              We design frameworks to launch professional careers. Not average lectures—but an active gateway to technological excellence.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {corePillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span className="text-xs font-bold text-brand-primary dark:text-brand-secondary">
                  0{index + 1}
                </span>
                <h3 className="mt-3 text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TIMELINE FUNCTION SECTION */}
      <section className="py-20 bg-section-alt border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-primary dark:text-brand-secondary">
              Ecosystem Path
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
              Four Steps to Professional Launch
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-4">
            {[
              {
                num: "01",
                title: "Apply & Enroll",
                desc: "Choose your path (Fullstack, Frontend, UI/UX, Systems). Gain cohort admission and direct environment setup.",
              },
              {
                num: "02",
                title: "Structured Training",
                desc: "Build active features week-by-week. Complete dynamic engineering milestones reviewed by tech leaders.",
              },
              {
                num: "03",
                title: "Guided Internships",
                desc: "Transition to actual projects under Sand-Hut systems. Tackle business tasks with experienced teams.",
              },
              {
                num: "04",
                title: "Credential Launch",
                desc: "Acquire your public cryptographic verified certificate. Enter placement pathways and land in top tech environments.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="relative rounded-2xl bg-white p-6 shadow-sm border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-900"
              >
                <div className="absolute top-0 right-0 -translate-y-4 translate-x-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-white text-xs font-extrabold shadow-sm">
                  {step.num}
                </div>
                <h3 className="mt-2 text-lg font-bold tracking-tight text-zinc-950 dark:text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION — Dynamic from Firebase */}
      <TestimonialsSection />

      {/* 8. DYNAMIC CALL-TO-ACTION TERMINAL */}
      <section className="mx-auto w-full max-w-7xl px-6 py-14 sm:px-10 lg:px-12">
        <div className="relative rounded-[2rem] bg-zinc-950 px-6 py-16 text-white dark:bg-white dark:text-zinc-950 sm:px-12 md:py-20 overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 h-64 w-64 rounded-full bg-brand-primary/20 dark:bg-brand-primary/10 blur-3xl"></div>
          <div className="absolute left-0 bottom-0 translate-y-12 -translate-x-12 h-64 w-64 rounded-full bg-brand-accent/20 dark:bg-brand-accent/10 blur-3xl"></div>

          <div className="relative z-10 max-w-3xl flex flex-col items-start">
            <span className="rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold tracking-wide uppercase dark:bg-zinc-950/10">
              Get Started Today
            </span>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl leading-tight">
              Start Your Practical Skill Journey with Sandevex
            </h2>
            <p className="mt-6 text-sm sm:text-base leading-7 text-zinc-300 dark:text-zinc-600">
              Whether you want to build strong programming foundations, master database scales, design beautiful products, or secure a high-quality guided internship, Sandevex is engineered to launch your potential.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-white px-7 py-4 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100 hover:scale-[1.02] dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-900"
              >
                Inquire & Apply Now
              </Link>
              <Link
                href="/verify"
                className="rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/10 dark:border-zinc-950/20 dark:text-zinc-950 dark:hover:bg-zinc-950/10"
              >
                Explore Registry Database
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold">
              <span>SLA GUARANTEE: Response within 2 hours</span>
              <span>•</span>
              <span>ISO 9001:2015 Approved</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}