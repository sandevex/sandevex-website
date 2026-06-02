import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

// GET /api/inquiries — list all inquiries (admin)
export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("inquiries")
      .orderBy("createdAt", "desc")
      .get();

    const inquiries = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    return Response.json({ inquiries });
  } catch (error) {
    console.error("GET /api/inquiries error:", error);
    return Response.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

// POST /api/inquiries — submit a new inquiry (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, inquiryType, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Generate ticket ID
    const ticketNum = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    const ticketId = `SX-${year}-${ticketNum}`;

    const inquiry = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      inquiryType: inquiryType || "General Inquiry",
      message: message.trim(),
      ticketId,
      status: "Open",
      notes: "",
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection("inquiries").add(inquiry);

    return Response.json(
      { success: true, ticketId, message: "Inquiry submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/inquiries error:", error);
    return Response.json({ error: "Failed to submit inquiry" }, { status: 500 });
  }
}
