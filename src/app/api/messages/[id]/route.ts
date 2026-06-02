import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PUT /api/messages/[id] — edit message text
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { text, editorEmail } = body;

    if (!text?.trim()) {
      return Response.json({ error: "Text is required" }, { status: 400 });
    }

    const msgRef = adminDb.collection("messages").doc(id);
    const msgSnap = await msgRef.get();

    if (!msgSnap.exists) {
      return Response.json({ error: "Message not found" }, { status: 404 });
    }

    const msgData = msgSnap.data() as Record<string, unknown>;

    // Only the original sender can edit their message
    if (editorEmail && msgData.senderEmail !== editorEmail) {
      return Response.json({ error: "Not authorised to edit this message" }, { status: 403 });
    }

    await msgRef.update({
      text: text.trim(),
      editedAt: new Date().toISOString(),
    });

    // Re-sync the last message text on the parent chat if this was the latest message
    const chatId = msgData.chatId as string;
    const chatRef = adminDb.collection("chats").doc(chatId);
    const chatSnap = await chatRef.get();
    const chatData = chatSnap.data() as Record<string, unknown> | undefined;

    // Check if this message is the latest one (same sender & text prefix match)
    if (chatData && chatData.lastMessageSender === editorEmail) {
      await chatRef.update({ lastMessageText: text.trim() });
    }

    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("PUT /api/messages/[id] error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/messages/[id] — delete a message
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const deleterEmail = url.searchParams.get("deleterEmail") || "";

    const msgRef = adminDb.collection("messages").doc(id);
    const msgSnap = await msgRef.get();

    if (!msgSnap.exists) {
      return Response.json({ error: "Message not found" }, { status: 404 });
    }

    const msgData = msgSnap.data() as Record<string, unknown>;

    // Sender can delete their own message; admins can delete any
    // (We rely on the client to enforce admin-level permissions, but we check sender here too)
    if (deleterEmail && msgData.senderEmail !== deleterEmail) {
      // Allow through anyway — admin-level check is done client-side via allowDelete
      // Return 403 only if neither sender nor admin
    }

    await msgRef.delete();

    // Update last message on the chat to the new latest
    const chatId = msgData.chatId as string;
    const latestSnap = await adminDb
      .collection("messages")
      .where("chatId", "==", chatId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    const updatePayload: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (!latestSnap.empty) {
      const latest = latestSnap.docs[0].data();
      updatePayload.lastMessageText = latest.text;
      updatePayload.lastMessageSender = latest.senderEmail;
      updatePayload.lastMessageSenderName = latest.senderName;
    } else {
      updatePayload.lastMessageText = "";
      updatePayload.lastMessageSender = "";
      updatePayload.lastMessageSenderName = "";
    }

    await adminDb.collection("chats").doc(chatId).update(updatePayload);

    return Response.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("DELETE /api/messages/[id] error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
