import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const chatId = url.searchParams.get("chatId");

    if (!chatId) {
      return Response.json({ error: "chatId is required" }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection("messages")
      .where("chatId", "==", chatId)
      .orderBy("createdAt", "asc")
      .limit(100)
      .get();

    const messages = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    return Response.json({ messages });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return Response.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, senderEmail, senderName, text } = body;

    if (!chatId || !senderEmail || !text) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Parse @email tags out of text
    // Example format: @instructor@sandevex.com or @student@sandevex.com
    const mentionRegex = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      const email = match[1];
      if (!mentions.includes(email) && email !== senderEmail) {
        mentions.push(email);
      }
    }

    const messageData = {
      chatId,
      senderEmail,
      senderName: senderName || senderEmail,
      text,
      mentions,
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("messages").add(messageData);

    // Retrieve chat information to identify type and name for the notification
    const chatSnap = await adminDb.collection("chats").doc(chatId).get();
    const chatData = chatSnap.data() || {};
    let locationName = "Direct Chat";
    if (chatData.type === "global") {
      locationName = "Global Announcements Hub";
    } else if (chatData.type === "group") {
      locationName = chatData.name || "Group Chat";
    }

    // If there are mentions, generate target notification alerts to trigger global toast popups
    if (mentions.length > 0) {
      const batch = adminDb.batch();
      for (const email of mentions) {
        const notifRef = adminDb.collection("notifications").doc();
        batch.set(notifRef, {
          title: `Tagged by ${senderName || senderEmail}`,
          message: `Mentioned you in ${locationName}: "${text.substring(0, 45)}${text.length > 45 ? "..." : ""}"`,
          type: "Action",
          target: email,
          readBy: [],
          createdAt: new Date().toISOString(),
        });
      }
      await batch.commit();
      console.log(`Dispatched ${mentions.length} live tagging notification popups for ${locationName}.`);
    }

    // Update chat document with the last message text, sender details, and timestamps
    await adminDb.collection("chats").doc(chatId).update({
      updatedAt: new Date().toISOString(),
      lastMessageText: text,
      lastMessageSender: senderEmail,
      lastMessageSenderName: senderName || senderEmail,
    });

    return Response.json({ success: true, docId: docRef.id, message: messageData }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/messages error:", error);
    return Response.json({ error: error.message || "Failed to dispatch message" }, { status: 500 });
  }
}
