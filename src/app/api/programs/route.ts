import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function GET() {
  try {
    const snapshot = await adminDb.collection("programs").orderBy("createdAt", "desc").get();
    
    const programs = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    return Response.json({ programs });
  } catch (error) {
    console.error("GET /api/programs error:", error);
    return Response.json({ error: "Failed to fetch programs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, duration, price, status } = body;

    if (!name || !duration || !price) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const docData = {
      name,
      description: description || "",
      duration,
      price: Number(price),
      status: status || "Active",
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("programs").add(docData);

    return Response.json(
      { success: true, docId: docRef.id, program: docData },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/programs error:", error);
    return Response.json({ error: error.message || "Failed to create program" }, { status: 500 });
  }
}
