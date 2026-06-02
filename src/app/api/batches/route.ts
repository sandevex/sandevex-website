import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const role = url.searchParams.get("role");

    let snapshot;
    if (role === "admin" || role === "superadmin") {
      snapshot = await adminDb.collection("batches").orderBy("createdAt", "desc").get();
    } else {
      snapshot = await adminDb.collection("batches").where("instructorEmail", "==", email).orderBy("createdAt", "desc").get();
    }

    const batches = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    return Response.json({ batches });
  } catch (error) {
    console.error("GET /api/batches error:", error);
    return Response.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, programName, instructorEmail, studentEmails } = body;

    if (!name || !programName || !instructorEmail) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const data = {
      name,
      programName,
      instructorEmail,
      studentEmails: studentEmails || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("batches").add(data);
    return Response.json({ success: true, docId: docRef.id, batch: data }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/batches error:", error);
    return Response.json({ error: error.message || "Failed to create batch" }, { status: 500 });
  }
}
