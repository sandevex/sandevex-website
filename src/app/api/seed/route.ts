import { adminDb, adminAuth } from "@/lib/firebase-admin";

// POST /api/seed — seed initial data into Firestore
export async function POST() {
  try {
    const batch = adminDb.batch();

    // ── Seed Credentials ────────────────────────────────────────────────
    const credentials = [
      {
        id: "SE-2026-F8A2",
        name: "Arjun Mehta",
        course: "Fullstack Web Engineering",
        grade: "Distinction (A+)",
        issueDate: "2026-04-15",
        status: "Active",
        type: "Certified Fullstack Developer",
        issuer: "Sandevex Labs in partnership with Sand-Hut Tech Solutions",
        createdAt: new Date().toISOString(),
      },
      {
        id: "SE-2026-K4B7",
        name: "Priya Sharma",
        course: "Frontend Engineering & Systems",
        grade: "Excellent (A)",
        issueDate: "2026-03-10",
        status: "Active",
        type: "Certified Frontend Engineer",
        issuer: "Sandevex Labs in partnership with Sand-Hut Tech Solutions",
        createdAt: new Date().toISOString(),
      },
      {
        id: "SE-2026-X9D4",
        name: "Rohan Sen",
        course: "UI/UX & Product Design",
        grade: "Outstanding (O)",
        issueDate: "2026-05-01",
        status: "Active",
        type: "Certified UX & Product Lead",
        issuer: "Sandevex Labs in partnership with Sand-Hut Tech Solutions",
        createdAt: new Date().toISOString(),
      },
    ];

    for (const cred of credentials) {
      const ref = adminDb.collection("credentials").doc();
      batch.set(ref, cred);
    }

    // ── Seed Testimonials ───────────────────────────────────────────────
    const testimonials = [
      {
        quote:
          "The project-based curriculum is incredibly intense but worth every second. Within months, I went from compiling simple scripts to deploying live, production-grade Next.js systems. The certificate verified registry helped me stand out immediately in my LinkedIn applications.",
        author: "Aditya Hegde",
        role: "Fullstack Engineer at TechSynergy",
        course: "Fullstack Web Engineering",
        stars: 5,
        approved: true,
        createdAt: new Date().toISOString(),
      },
      {
        quote:
          "Sandevex's affiliation with Sand-Hut gives it a standard of trust that ordinary bootcamps just don't have. Having mentors audit my styling files and codebase taught me practical standards that are highly relevant to my daily work as a professional designer.",
        author: "Sneha Nair",
        role: "Product Designer at VeloLabs",
        course: "UI/UX & Product Design",
        stars: 5,
        approved: true,
        createdAt: new Date().toISOString(),
      },
      {
        quote:
          "The certificate verification registry is a brilliant trust builder. During my technical round, the hiring manager explicitly clicked and validated my Sandevex credential online. It immediately proved that my practical learning was authentic and backed by professional standards.",
        author: "Rohan Kulkarni",
        role: "Frontend Developer at DevDynamics",
        course: "Frontend Engineering & Systems",
        stars: 5,
        approved: true,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const t of testimonials) {
      const ref = adminDb.collection("testimonials").doc();
      batch.set(ref, t);
    }

    // ── Seed Programs ───────────────────────────────────────────────────
    const dbPrograms = [
      {
        name: "Fullstack Web Engineering",
        duration: "16 Weeks",
        level: "Intermediate to Advanced",
        description: "Build complex web systems from database design to frontend optimization. Master Next.js, Postgres, Redis, and high-throughput server architecture.",
        skills: ["Next.js & React Server Components", "Postgres, Prisma & Database Tuning", "RESTful & GraphQL API Design", "Docker & Cloud Deployment Basics"],
        badge: "Placement Linked",
        price: 45000,
        status: "Active",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Frontend Engineering & Systems",
        duration: "12 Weeks",
        level: "Beginner to Intermediate",
        description: "Develop ultra-responsive, beautiful web interfaces. Master design patterns, performance optimizations, state management, and modern CSS/Tailwind engines.",
        skills: ["Modern ES6+ & TypeScript Essentials", "React & Component Design Patterns", "Tailwind CSS v4 & Motion Engines", "Web Vitals & Performance Auditing"],
        badge: "Most Popular",
        price: 35000,
        status: "Active",
        createdAt: new Date().toISOString(),
      },
      {
        name: "UI/UX & Product Design",
        duration: "10 Weeks",
        level: "All Levels Welcome",
        description: "Design gorgeous, highly conversion-optimized digital products. Work on user research, responsive layouts, prototyping, and developer handoffs.",
        skills: ["Design Systems & Style Guides", "Figma High-Fidelity Prototyping", "User Research & Interaction Models", "A/B Testing & Product Metrics"],
        badge: "Creative Hub",
        price: 30000,
        status: "Active",
        createdAt: new Date().toISOString(),
      },
      {
        name: "Systems & Database Architecture",
        duration: "14 Weeks",
        level: "Advanced Track",
        description: "Gain deeper architectural command. Master scalability, caching hierarchies, database shards, microservices, and reliable server-to-server operations.",
        skills: ["Microservices Architecture & REST", "Redis Caching & Queue Management", "DB Sharding & Horizontal Scaling", "CI/CD Pipelines & Secure Access"],
        badge: "Specialized Track",
        price: 50000,
        status: "Active",
        createdAt: new Date().toISOString(),
      }
    ];

    // Clear old programs
    const oldPrograms = await adminDb.collection("programs").get();
    for (const doc of oldPrograms.docs) {
      batch.delete(doc.ref);
    }

    for (const p of dbPrograms) {
      const ref = adminDb.collection("programs").doc();
      batch.set(ref, p);
    }

    // ── Seed Syllabi ────────────────────────────────────────────────────
    const dbSyllabi = [
      {
        title: "Fullstack Web Engineering Core Syllabus",
        course: "Fullstack Web Engineering",
        description: "Advanced syllabus covering end-to-end fullstack development, database architecture, and production deployment.",
        weeks: [
          "Week 1: React Server Components & Next.js App Router",
          "Week 2: Advanced TypeScript & State Engines",
          "Week 3: Relational DBs, Postgres Schema & Indexes",
          "Week 4: Prisma ORM Integration & Connection Pools",
          "Week 5: Backend REST APIs & Next.js Route Handlers",
          "Week 6: Real-time Communication with WebSockets",
          "Week 7: Redis Caching Strategies & Job Queues",
          "Week 8: Docker Containerization & Cloud VPS Basics"
        ],
        staffEmail: "admin@sandevex.com",
        staffName: "Super Admin",
        status: "Approved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        title: "Frontend Engineering & Systems Syllabus",
        course: "Frontend Engineering & Systems",
        description: "Master modern UI development, performance audits, and high-fidelity motion graphics.",
        weeks: [
          "Week 1: Modern JavaScript ES6+ & TypeScript Typings",
          "Week 2: Component Structure & UI Design Systems",
          "Week 3: CSS Flexbox, Grid & Tailwind CSS v4 Hooks",
          "Week 4: Dynamic Animations with Framer Motion",
          "Week 5: State Management with Zustand & Context",
          "Week 6: Web Performance Auditing & Core Web Vitals"
        ],
        staffEmail: "admin@sandevex.com",
        staffName: "Super Admin",
        status: "Approved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        title: "UI/UX & Product Design Syllabus",
        course: "UI/UX & Product Design",
        description: "A comprehensive guide to conversion-driven interfaces, Figma design systems, and product metrics.",
        weeks: [
          "Week 1: User Psychology, Empathy Maps & UX Research",
          "Week 2: Figma Layouts, Constraints & Style Guides",
          "Week 3: Interactive Prototyping & Dynamic Component States",
          "Week 4: User Flows, Wireframing & Developer Handoffs",
          "Week 5: Product A/B Testing & Funnel Conversions"
        ],
        staffEmail: "admin@sandevex.com",
        staffName: "Super Admin",
        status: "Approved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        title: "Systems & Database Architecture Syllabus",
        course: "Systems & Database Architecture",
        description: "Gain deeper technical command over horizontally scaled database instances, caching hierarchies, and microservices.",
        weeks: [
          "Week 1: Horizontal Scaling, Load Balancers & Nginx Routing",
          "Week 2: Redis In-memory Clusters & Database Shards",
          "Week 3: Message Brokers & Distributed Task Queues (BullMQ)",
          "Week 4: Microservices Coordination & REST/gRPC Communication",
          "Week 5: DevOps Pipelines, CI/CD Actions & AWS Registry"
        ],
        staffEmail: "admin@sandevex.com",
        staffName: "Super Admin",
        status: "Approved",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    // Clear old syllabi
    const oldSyllabi = await adminDb.collection("syllabus").get();
    for (const doc of oldSyllabi.docs) {
      batch.delete(doc.ref);
    }

    for (const s of dbSyllabi) {
      const ref = adminDb.collection("syllabus").doc();
      batch.set(ref, s);
    }

    // ── Seed Admin User ────────────────────────────────────────────────
    let authUser;
    try {
      authUser = await adminAuth.getUserByEmail("admin@sandevex.com");
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        console.log("Creating default admin auth user...");
        authUser = await adminAuth.createUser({
          email: "admin@sandevex.com",
          password: "123456",
          displayName: "Super Admin",
        });
      } else {
        throw error;
      }
    }

    const adminRef = adminDb.collection("admins").doc();
    batch.set(adminRef, {
      email: authUser.email,
      role: "superadmin",
      status: "Active",
      uid: authUser.uid,
      createdAt: new Date().toISOString(),
    });

    await batch.commit();

    return Response.json({
      success: true,
      message: "Seeded 3 credentials, 3 testimonials, and 1 admin",
    });
  } catch (error) {
    console.error("POST /api/seed error:", error);
    return Response.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
