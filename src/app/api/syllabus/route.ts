import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const role = url.searchParams.get("role");

    let snapshot;
    if (role === "admin" || role === "superadmin") {
      snapshot = await adminDb.collection("syllabus").orderBy("createdAt", "desc").get();
    } else {
      snapshot = await adminDb.collection("syllabus").where("staffEmail", "==", email).orderBy("createdAt", "desc").get();
    }

    const syllabus = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    return Response.json({ syllabus });
  } catch (error) {
    console.error("GET /api/syllabus error:", error);
    return Response.json({ error: "Failed to fetch syllabus" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, course, description, weeks, staffEmail, staffName } = body;

    const data = {
      title,
      course,
      description,
      weeks: weeks || [],
      staffEmail,
      staffName,
      status: "Draft", // Draft -> Pending Approval -> Approved -> Rejected
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("syllabus").add(data);
    return Response.json({ success: true, docId: docRef.id }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/syllabus error:", error);
    return Response.json({ error: "Failed to create syllabus" }, { status: 500 });
  }
}
