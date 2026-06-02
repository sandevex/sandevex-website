import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

// GET /api/credentials — list all or search by query
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (id) {
      // Public: search by credential ID
      const cleanId = id.trim().toUpperCase();
      const snapshot = await adminDb
        .collection("credentials")
        .where("id", "==", cleanId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return Response.json({ found: false, credential: null }, { status: 404 });
      }

      const doc = snapshot.docs[0];
      return Response.json({ found: true, credential: { docId: doc.id, ...doc.data() } });
    }

    // Admin: list all credentials
    const snapshot = await adminDb
      .collection("credentials")
      .orderBy("createdAt", "desc")
      .get();

    const credentials = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    return Response.json({ credentials });
  } catch (error) {
    console.error("GET /api/credentials error:", error);
    return Response.json({ error: "Failed to fetch credentials" }, { status: 500 });
  }
}

// POST /api/credentials — create a new credential
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, course, grade, issueDate, status, type, issuer } = body;

    if (!id || !name || !course || !grade || !issueDate) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check for duplicate ID
    const existing = await adminDb
      .collection("credentials")
      .where("id", "==", id.trim().toUpperCase())
      .limit(1)
      .get();

    if (!existing.empty) {
      return Response.json({ error: "Credential ID already exists" }, { status: 409 });
    }

    const credential = {
      id: id.trim().toUpperCase(),
      name: name.trim(),
      course,
      grade,
      issueDate,
      status: status || "Active",
      type: type || "Certified Professional",
      issuer: issuer || "Sandevex Labs in partnership with Sand-Hut Tech Solutions",
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("credentials").add(credential);

    return Response.json({ success: true, docId: docRef.id, credential }, { status: 201 });
  } catch (error) {
    console.error("POST /api/credentials error:", error);
    return Response.json({ error: "Failed to create credential" }, { status: 500 });
  }
}
