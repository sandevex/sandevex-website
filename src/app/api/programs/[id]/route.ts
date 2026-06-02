import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    if (updateData.price) {
      updateData.price = Number(updateData.price);
    }

    await adminDb.collection("programs").doc(id).update(updateData);

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/programs error:", error);
    return Response.json({ error: error.message || "Failed to update program" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await adminDb.collection("programs").doc(id).delete();

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/programs error:", error);
    return Response.json({ error: "Failed to delete program" }, { status: 500 });
  }
}
