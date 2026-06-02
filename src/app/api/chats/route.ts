import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Fetch all chats where the user's email is a participant
    const snapshot = await adminDb
      .collection("chats")
      .where("participants", "array-contains", email)
      .orderBy("updatedAt", "desc")
      .get();

    const chats = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    return Response.json({ chats });
  } catch (error) {
    console.error("GET /api/chats error:", error);
    return Response.json({ error: "Failed to fetch chats" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { participants, type, name } = body; // type: "direct" | "group" | "global"

    if (!participants || !Array.isArray(participants) || (type !== "global" && participants.length < 2)) {
      return Response.json({ error: "At least two participants are required" }, { status: 400 });
    }

    // For global chats, verify if a thread already exists to prevent duplicates
    if (type === "global") {
      const existingSnapshot = await adminDb
        .collection("chats")
        .where("type", "==", "global")
        .limit(1)
        .get();

      if (!existingSnapshot.empty) {
        const first = existingSnapshot.docs[0];
        return Response.json({
          success: true,
          docId: first.id,
          chat: first.data(),
          existed: true,
        });
      }
    }

    // For direct chats, verify if a thread already exists to prevent duplicate channels
    if (type === "direct") {
      const p1 = participants[0];
      const p2 = participants[1];

      const existingSnapshot = await adminDb
        .collection("chats")
        .where("type", "==", "direct")
        .where("participants", "array-contains", p1)
        .get();

      const existingChat = existingSnapshot.docs.find((doc) => {
        const parts = doc.data().participants || [];
        return parts.includes(p2);
      });

      if (existingChat) {
        return Response.json({
          success: true,
          docId: existingChat.id,
          chat: existingChat.data(),
          existed: true,
        });
      }
    }

    const data = {
      participants,
      type: type || "direct",
      name: name || "",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("chats").add(data);
    return Response.json({ success: true, docId: docRef.id, chat: data }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/chats error:", error);
    return Response.json({ error: error.message || "Failed to create chat room" }, { status: 500 });
  }
}
