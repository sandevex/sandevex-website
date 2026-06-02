import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

// PUT /api/notifications/[id] — Mark as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return Response.json({ error: "Email required" }, { status: 400 });
    }

    const docRef = adminDb.collection("notifications").doc(id);
    await docRef.update({
      readBy: FieldValue.arrayUnion(email)
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/notifications error:", error);
    return Response.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

// DELETE /api/notifications/[id] — Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await adminDb.collection("notifications").doc(id).delete();
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
