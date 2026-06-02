import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

// GET /api/credentials/[id] — fetch single credential by doc ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection("credentials").doc(id).get();

    if (!doc.exists) {
      return Response.json({ error: "Credential not found" }, { status: 404 });
    }

    return Response.json({ credential: { docId: doc.id, ...doc.data() } });
  } catch (error) {
    console.error("GET /api/credentials/[id] error:", error);
    return Response.json({ error: "Failed to fetch credential" }, { status: 500 });
  }
}

// PUT /api/credentials/[id] — update a credential
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const doc = await adminDb.collection("credentials").doc(id).get();
    if (!doc.exists) {
      return Response.json({ error: "Credential not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ["name", "course", "grade", "issueDate", "status", "type", "issuer"];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    updateData.updatedAt = new Date().toISOString();

    await adminDb.collection("credentials").doc(id).update(updateData);

    return Response.json({ success: true, updated: updateData });
  } catch (error) {
    console.error("PUT /api/credentials/[id] error:", error);
    return Response.json({ error: "Failed to update credential" }, { status: 500 });
  }
}

// DELETE /api/credentials/[id] — delete a credential
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doc = await adminDb.collection("credentials").doc(id).get();
    if (!doc.exists) {
      return Response.json({ error: "Credential not found" }, { status: 404 });
    }

    await adminDb.collection("credentials").doc(id).delete();

    return Response.json({ success: true, deleted: id });
  } catch (error) {
    console.error("DELETE /api/credentials/[id] error:", error);
    return Response.json({ error: "Failed to delete credential" }, { status: 500 });
  }
}
