import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

// PUT /api/inquiries/[id] — update inquiry status/notes (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const doc = await adminDb.collection("inquiries").doc(id).get();
    if (!doc.exists) {
      return Response.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ["status", "notes"];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    updateData.updatedAt = new Date().toISOString();

    await adminDb.collection("inquiries").doc(id).update(updateData);

    return Response.json({ success: true, updated: updateData });
  } catch (error) {
    console.error("PUT /api/inquiries/[id] error:", error);
    return Response.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}

// DELETE /api/inquiries/[id] — delete an inquiry (admin)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doc = await adminDb.collection("inquiries").doc(id).get();
    if (!doc.exists) {
      return Response.json({ error: "Inquiry not found" }, { status: 404 });
    }

    await adminDb.collection("inquiries").doc(id).delete();

    return Response.json({ success: true, deleted: id });
  } catch (error) {
    console.error("DELETE /api/inquiries/[id] error:", error);
    return Response.json({ error: "Failed to delete inquiry" }, { status: 500 });
  }
}
