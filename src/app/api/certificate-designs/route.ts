import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    if (type) {
      const snapshot = await adminDb
        .collection("certificate_designs")
        .where("type", "==", type)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return Response.json({ design: null });
      }

      const design = {
        docId: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      };
      return Response.json({ design });
    }

    const snapshot = await adminDb.collection("certificate_designs").get();
    const designs = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    return Response.json({ designs });
  } catch (error) {
    console.error("GET /api/certificate-designs error:", error);
    return Response.json({ error: "Failed to fetch certificate templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      subtitle1,
      subtitle2,
      signatoryName,
      signatoryTitle,
      signatorySub,
      sealS,
      footerText,
    } = body;

    if (!type || !title) {
      return Response.json({ error: "Type and Title are required fields" }, { status: 400 });
    }

    // Check if design already exists for this type
    const snapshot = await adminDb
      .collection("certificate_designs")
      .where("type", "==", type)
      .limit(1)
      .get();

    const data = {
      type,
      title,
      subtitle1: subtitle1 || "",
      subtitle2: subtitle2 || "",
      signatoryName: signatoryName || "",
      signatoryTitle: signatoryTitle || "",
      signatorySub: signatorySub || "",
      sealS: sealS || "S",
      footerText: footerText || "",
      updatedAt: new Date().toISOString(),
    };

    if (!snapshot.empty) {
      const docId = snapshot.docs[0].id;
      await adminDb.collection("certificate_designs").doc(docId).update(data);
      return Response.json({ success: true, docId, design: data });
    }

    const docRef = await adminDb.collection("certificate_designs").add(data);
    return Response.json({ success: true, docId: docRef.id, design: data }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/certificate-designs error:", error);
    return Response.json({ error: error.message || "Failed to save design template" }, { status: 500 });
  }
}
