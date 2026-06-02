import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updateData = { ...body, updatedAt: new Date().toISOString() };
    delete updateData.docId;

    const docRef = adminDb.collection("batches").doc(id);
    await docRef.update(updateData);

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/batches/[id] error:", error);
    return Response.json({ error: "Failed to update batch" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await adminDb.collection("batches").doc(id).delete();
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/batches/[id] error:", error);
    return Response.json({ error: "Failed to delete batch" }, { status: 500 });
  }
}
