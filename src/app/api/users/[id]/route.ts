import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

// PUT /api/users/[id] — update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      email, password, name, role, status, uid, hourlyRate,
      address, pan, aadhaar, bankName, bankAccount, ifsc,
      hasPF, hasESI, hasPT, hasTDS, tdsPercent, dob, phone, gender,
      allowDelete
    } = body;

    const updateData: any = {
      email,
      name,
      role,
      status,
      updatedAt: new Date().toISOString(),
    };

    if (hourlyRate !== undefined) {
      updateData.hourlyRate = Number(hourlyRate);
    }

    if (dob !== undefined) updateData.dob = dob || "";
    if (phone !== undefined) updateData.phone = phone || "";
    if (gender !== undefined) updateData.gender = gender || "Male";
    if (address !== undefined) updateData.address = address || "";
    if (pan !== undefined) updateData.pan = pan ? pan.trim().toUpperCase() : "";
    if (aadhaar !== undefined) updateData.aadhaar = aadhaar ? aadhaar.trim() : "";
    if (bankName !== undefined) updateData.bankName = bankName || "";
    if (bankAccount !== undefined) updateData.bankAccount = bankAccount || "";
    if (ifsc !== undefined) updateData.ifsc = ifsc ? ifsc.trim().toUpperCase() : "";
    if (hasPF !== undefined) updateData.hasPF = hasPF === true;
    if (hasESI !== undefined) updateData.hasESI = hasESI === true;
    if (hasPT !== undefined) updateData.hasPT = hasPT === true;
    if (hasTDS !== undefined) updateData.hasTDS = hasTDS === true;
    if (tdsPercent !== undefined) updateData.tdsPercent = Number(tdsPercent);
    if (allowDelete !== undefined) updateData.allowDelete = allowDelete === true;

    // 1. Update Firestore
    const docRef = adminDb.collection("admins").doc(id);
    await docRef.update(updateData);

    // 2. Update Firebase Auth if uid is provided
    if (uid) {
      const authUpdates: any = {};
      if (email) authUpdates.email = email;
      if (password) authUpdates.password = password;
      if (name) authUpdates.displayName = name;

      if (Object.keys(authUpdates).length > 0) {
        await adminAuth.updateUser(uid, authUpdates);
      }
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/users error:", error);
    return Response.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/users/[id] — delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the user to find their uid
    const docRef = adminDb.collection("admins").doc(id);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      // Delete from Firebase Auth if uid exists
      if (data?.uid) {
        try {
          await adminAuth.deleteUser(data.uid);
        } catch (err) {
          console.error("Auth user delete failed:", err);
        }
      }
    }

    // Delete from Firestore
    await docRef.delete();

    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/users error:", error);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
