import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // We only update the provided fields
    const updateData = { ...body, updatedAt: new Date().toISOString() };
    
    // Ensure we don't accidentally update the docId if it was sent in body
    delete updateData.docId;

    const docRef = adminDb.collection("syllabus").doc(id);
    await docRef.update(updateData);

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/syllabus/[id] error:", error);
    return Response.json({ error: "Failed to update syllabus" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await adminDb.collection("syllabus").doc(id).delete();
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/syllabus/[id] error:", error);
    return Response.json({ error: "Failed to delete syllabus" }, { status: 500 });
  }
}
