import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

// PUT /api/testimonials/[id] — approve/edit testimonial (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const doc = await adminDb.collection("testimonials").doc(id).get();
    if (!doc.exists) {
      return Response.json({ error: "Testimonial not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = ["quote", "author", "role", "course", "stars", "approved"];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (updateData.stars !== undefined) {
      updateData.stars = Math.min(5, Math.max(1, Number(updateData.stars)));
    }

    updateData.updatedAt = new Date().toISOString();

    await adminDb.collection("testimonials").doc(id).update(updateData);

    return Response.json({ success: true, updated: updateData });
  } catch (error) {
    console.error("PUT /api/testimonials/[id] error:", error);
    return Response.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

// DELETE /api/testimonials/[id] — delete testimonial (admin)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doc = await adminDb.collection("testimonials").doc(id).get();
    if (!doc.exists) {
      return Response.json({ error: "Testimonial not found" }, { status: 404 });
    }

    await adminDb.collection("testimonials").doc(id).delete();

    return Response.json({ success: true, deleted: id });
  } catch (error) {
    console.error("DELETE /api/testimonials/[id] error:", error);
    return Response.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
