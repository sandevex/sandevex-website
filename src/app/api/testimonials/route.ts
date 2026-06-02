import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

// GET /api/testimonials — fetch testimonials
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const all = searchParams.get("all"); // admin flag

    const query = adminDb.collection("testimonials").orderBy("createdAt", "desc");
    const snapshot = await query.get();

    let testimonials = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    // Public: only approved testimonials
    if (!all) {
      testimonials = testimonials.filter((t: any) => t.approved === true);
    }

    return Response.json({ testimonials });
  } catch (error) {
    console.error("GET /api/testimonials error:", error);
    return Response.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

// POST /api/testimonials — submit a new testimonial (public or admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quote, author, role, course, stars, approved } = body;

    if (!quote || !author || !role || !course) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const testimonial = {
      quote: quote.trim(),
      author: author.trim(),
      role: role.trim(),
      course: course.trim(),
      stars: Math.min(5, Math.max(1, Number(stars) || 5)),
      approved: approved === true, // Public submissions default to false
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("testimonials").add(testimonial);

    return Response.json(
      { success: true, docId: docRef.id, testimonial },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/testimonials error:", error);
    return Response.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
