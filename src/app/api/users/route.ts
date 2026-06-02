import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

// GET /api/users — fetch all users
export async function GET() {
  try {
    const snapshot = await adminDb.collection("admins").orderBy("createdAt", "desc").get();
    
    const users = snapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    }));

    return Response.json({ users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST /api/users — Create a new user (Auth + Firestore)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, password, name, role, status, hourlyRate,
      address, pan, aadhaar, bankName, bankAccount, ifsc,
      hasPF, hasESI, hasPT, hasTDS, tdsPercent, dob, phone, gender,
      allowDelete
    } = body;

    if (!email || !password || !role) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create user in Firebase Auth
    const authUser = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Add user to Firestore 'admins' collection
    const userData = {
      email,
      name: name || "",
      role: role || "staff",
      status: status || "Active",
      hourlyRate: hourlyRate ? Number(hourlyRate) : 0,
      uid: authUser.uid,
      createdAt: new Date().toISOString(),
      dob: dob || "",
      phone: phone || "",
      gender: gender || "Male",
      address: address || "",
      pan: pan ? pan.trim().toUpperCase() : "",
      aadhaar: aadhaar ? aadhaar.trim() : "",
      bankName: bankName || "",
      bankAccount: bankAccount || "",
      ifsc: ifsc ? ifsc.trim().toUpperCase() : "",
      hasPF: hasPF === true,
      hasESI: hasESI === true,
      hasPT: hasPT === true,
      hasTDS: hasTDS === true,
      tdsPercent: tdsPercent !== undefined ? Number(tdsPercent) : 10,
      allowDelete: allowDelete === true,
    };

    const docRef = await adminDb.collection("admins").add(userData);

    return Response.json(
      { success: true, docId: docRef.id, user: userData },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    return Response.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}
