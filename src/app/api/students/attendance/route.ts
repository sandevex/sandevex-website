import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const program = url.searchParams.get("program");
    const date = url.searchParams.get("date");

    if (!program || !date) {
      return Response.json({ error: "Missing program or date parameter" }, { status: 400 });
    }

    const docId = `${program.replace(/[^a-zA-Z0-9]/g, "_")}_${date}`;
    const doc = await adminDb.collection("studentAttendance").doc(docId).get();

    if (doc.exists) {
      return Response.json({ records: doc.data()?.records || {} });
    }
    
    return Response.json({ records: {} });
  } catch (error: any) {
    console.error("GET /api/students/attendance error:", error);
    return Response.json({ error: error.message || "Failed to fetch student attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { program, date, attendance, markedBy } = body;

    if (!program || !date || !attendance) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const docId = `${program.replace(/[^a-zA-Z0-9]/g, "_")}_${date}`;
    await adminDb.collection("studentAttendance").doc(docId).set({
      program,
      date,
      records: attendance,
      markedBy: markedBy || "System",
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/students/attendance error:", error);
    return Response.json({ error: error.message || "Failed to save student attendance" }, { status: 500 });
  }
}
