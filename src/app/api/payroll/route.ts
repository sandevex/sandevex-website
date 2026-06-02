import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const month = url.searchParams.get("month"); // e.g. "2026-05"
    const role = url.searchParams.get("role");
    const emailParam = url.searchParams.get("email");

    const isAuthorized = role === "admin" || role === "superadmin" || role === "accountant";

    if (!isAuthorized && !emailParam) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    // 1. Fetch relevant users
    let usersSnap;
    if (isAuthorized) {
      usersSnap = await adminDb.collection("admins").get();
    } else {
      usersSnap = await adminDb.collection("admins").where("email", "==", emailParam).get();
    }

    const usersMap = new Map();
    usersSnap.docs.forEach(doc => {
      const data = doc.data();
      usersMap.set(data.email, {
        name: data.name,
        role: data.role,
        hourlyRate: data.hourlyRate || 0,
        address: data.address || "",
        pan: data.pan || "",
        aadhaar: data.aadhaar || "",
        bankName: data.bankName || "",
        bankAccount: data.bankAccount || "",
        ifsc: data.ifsc || "",
        hasPF: !!data.hasPF,
        hasESI: !!data.hasESI,
        hasPT: !!data.hasPT,
        hasTDS: !!data.hasTDS,
        tdsPercent: data.tdsPercent || 10,
      });
    });

    // 2. Fetch attendance for the specific month
    const startStr = `${month}-01`;
    const endStr = `${month}-31`;

    let attendanceSnap;
    if (isAuthorized) {
      attendanceSnap = await adminDb.collection("attendance")
        .where("date", ">=", startStr)
        .where("date", "<=", endStr)
        .get();
    } else {
      attendanceSnap = await adminDb.collection("attendance")
        .where("email", "==", emailParam)
        .where("date", ">=", startStr)
        .where("date", "<=", endStr)
        .get();
    }

    // 3. Aggregate hours by user
    const userTotals = new Map();
    
    // Pre-initialize all active database users to 0 hours so everyone is always present on payroll sheets
    usersMap.forEach((user, email) => {
      userTotals.set(email, {
        totalHours: 0,
        attendanceRecords: 0
      });
    });

    attendanceSnap.docs.forEach(doc => {
      const data = doc.data();
      const email = data.email;
      const hours = Number(data.totalHours || 0);

      if (userTotals.has(email)) {
        const current = userTotals.get(email);
        current.totalHours += hours;
        current.attendanceRecords += 1;
        userTotals.set(email, current);
      } else {
        userTotals.set(email, {
          totalHours: hours,
          attendanceRecords: 1
        });
      }
    });

    // 4. Combine data
    const payrollData: any[] = [];
    userTotals.forEach((data, email) => {
      const user = usersMap.get(email);
      if (!user) return; // If user was deleted or not matching emailParam

      const totalPay = data.totalHours * user.hourlyRate;
      
      payrollData.push({
        email,
        name: user.name,
        role: user.role,
        hourlyRate: user.hourlyRate,
        totalHours: Number(data.totalHours.toFixed(2)),
        attendanceRecords: data.attendanceRecords,
        totalPay: Number(totalPay.toFixed(2)),
        address: user.address,
        pan: user.pan,
        aadhaar: user.aadhaar,
        bankName: user.bankName,
        bankAccount: user.bankAccount,
        ifsc: user.ifsc,
        hasPF: user.hasPF,
        hasESI: user.hasESI,
        hasPT: user.hasPT,
        hasTDS: user.hasTDS,
        tdsPercent: user.tdsPercent,
      });
    });

    // If staff member has no attendance records this month, they should still be returned with 0 hours
    if (!isAuthorized && emailParam && payrollData.length === 0) {
      const user = usersMap.get(emailParam);
      if (user) {
        payrollData.push({
          email: emailParam,
          name: user.name,
          role: user.role,
          hourlyRate: user.hourlyRate,
          totalHours: 0,
          attendanceRecords: 0,
          totalPay: 0,
          address: user.address,
          pan: user.pan,
          aadhaar: user.aadhaar,
          bankName: user.bankName,
          bankAccount: user.bankAccount,
          ifsc: user.ifsc,
          hasPF: user.hasPF,
          hasESI: user.hasESI,
          hasPT: user.hasPT,
          hasTDS: user.hasTDS,
          tdsPercent: user.tdsPercent,
        });
      }
    }

    return Response.json({ payroll: payrollData });
  } catch (error) {
    console.error("GET /api/payroll error:", error);
    return Response.json({ error: "Failed to fetch payroll" }, { status: 500 });
  }
}
