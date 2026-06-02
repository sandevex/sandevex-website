import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Fetch all notifications (we will filter in-memory since Firestore OR queries are complex across different fields)
    const snapshot = await adminDb.collection("notifications")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    
    const notifications = snapshot.docs.map(doc => ({
      docId: doc.id,
      ...doc.data(),
    })).filter((n: any) => n.target === "All" || n.target === email);

    return Response.json({ notifications });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return Response.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, message, type, target } = body;

    if (!title || !message || !type || !target) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const docRef = await adminDb.collection("notifications").add({
      title,
      message,
      type,
      target, // "All" or a specific user email
      readBy: [], // Array of emails who have read this
      createdAt: new Date().toISOString()
    });

    return Response.json({ success: true, docId: docRef.id }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/notifications error:", error);
    return Response.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
