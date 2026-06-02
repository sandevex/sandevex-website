import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const role = url.searchParams.get("role");

    let snapshot;
    if (role === "admin" || role === "superadmin") {
      snapshot = await adminDb.collection("students").orderBy("createdAt", "desc").get();
    } else {
      snapshot = await adminDb.collection("students").where("staffEmail", "==", email).orderBy("createdAt", "desc").get();
    }

    const students = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    return Response.json({ students });
  } catch (error) {
    console.error("GET /api/students error:", error);
    return Response.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, program, staffEmail, dob, phone, gender, positionTitle, startDate, workingHours, location } = body;

    if (!name || !email || !program) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Provision Firebase Auth account automatically for the student
    let authUid = "";
    try {
      const existingUser = await adminAuth.getUserByEmail(email);
      authUid = existingUser.uid;
      console.log(`Auth user already exists for student email: ${email}`);
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        const newAuthUser = await adminAuth.createUser({
          email,
          password: "123456",
          displayName: name,
        });
        authUid = newAuthUser.uid;
        console.log(`Auth user created for student email: ${email}`);
      } else {
        throw err;
      }
    }

    const data = {
      name,
      email,
      program,
      staffEmail,
      dob: dob || "",
      phone: phone || "",
      gender: gender || "Male",
      positionTitle: positionTitle || "",
      startDate: startDate || "",
      workingHours: workingHours || "",
      location: location || "",
      uid: authUid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("students").add(data);
    return Response.json({ success: true, docId: docRef.id, uid: authUid }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/students error:", error);
    return Response.json({ error: error.message || "Failed to create student" }, { status: 500 });
  }
}
