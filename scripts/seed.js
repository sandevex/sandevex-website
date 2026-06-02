const fs = require("fs");
const path = require("path");

// 1. Manually parse .env.local variables to load Firebase Credentials
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([^#\s=]+)\s*=\s*(.*)\s*$/);
    if (match) {
      let val = match[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      process.env[match[1]] = val;
    }
  });
  console.log("Loaded Firebase environments from .env.local successfully.");
} else {
  console.error("Could not find .env.local file at " + envPath);
}

// 2. Initialize Firebase Admin SDK
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("Missing Firebase Admin SDK credentials in environments!");
  process.exit(1);
}

const serviceAccount = {
  projectId,
  clientEmail,
  privateKey,
};

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

async function runSeed() {
  console.log("Starting Sandevex Program & Syllabus database seed...");
  const batch = db.batch();

  // ── Seed Programs ───────────────────────────────────────────────────
  const programs = [
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

  // Purge old programs
  const oldProgramsSnapshot = await db.collection("programs").get();
  console.log(`Clearing ${oldProgramsSnapshot.size} outdated programs...`);
  oldProgramsSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  programs.forEach((p) => {
    const ref = db.collection("programs").doc();
    batch.set(ref, p);
  });

  // ── Seed Syllabi ────────────────────────────────────────────────────
  const syllabi = [
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

  // Purge old syllabi
  const oldSyllabiSnapshot = await db.collection("syllabus").get();
  console.log(`Clearing ${oldSyllabiSnapshot.size} outdated syllabi...`);
  oldSyllabiSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  syllabi.forEach((s) => {
    const ref = db.collection("syllabus").doc();
    batch.set(ref, s);
  });

  await batch.commit();
  console.log("Sandevex seeding completed successfully! All 4 programs and syllabi have been loaded.");
}

runSeed().catch((err) => {
  console.error("Seeding execution failed:", err);
});
