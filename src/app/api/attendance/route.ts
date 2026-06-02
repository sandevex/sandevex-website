import { adminDb } from "@/lib/firebase-admin";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const role = url.searchParams.get("role");

    let snapshot;
    if (role === "admin" || role === "superadmin" || role === "accountant") {
      snapshot = await adminDb.collection("attendance").orderBy("date", "desc").get();
    } else {
      snapshot = await adminDb.collection("attendance").where("email", "==", email).orderBy("date", "desc").get();
    }

    const logs = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Backward compatibility: virtualize legacy flat records as single-session days
      if (!data.sessions && data.clockIn) {
        data.sessions = [{
          clockIn: data.clockIn,
          clockOut: data.clockOut || null,
          clockInNote: data.clockInNote || "Legacy Session",
          clockOutNote: data.clockOutNote || "",
          hours: data.totalHours || 0
        }];
      }
      return {
        docId: doc.id,
        ...data,
      };
    });

    return Response.json({ logs });
  } catch (error) {
    console.error("GET /api/attendance error:", error);
    return Response.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, action, timestamp, docId, note, overrideClockIn, overrideClockOut, overrideTotal } = body;

    const today = new Date(timestamp || Date.now()).toISOString().split("T")[0];

    // Admin override flow
    if (action === "override") {
      if (!docId) return Response.json({ error: "No document ID provided" }, { status: 400 });
      
      const updateData: any = {
        status: "Completed (Edited by Admin)",
        updatedAt: new Date().toISOString()
      };

      if (body.sessions) {
        updateData.sessions = body.sessions;
        updateData.totalHours = Number(body.sessions.reduce((acc: number, s: any) => acc + Number(s.hours || 0), 0).toFixed(2));
      } else {
        // Fallback for single/flat overrides if called by legacy client code
        updateData.sessions = [{
          clockIn: overrideClockIn,
          clockOut: overrideClockOut || null,
          clockInNote: "Edited by Admin",
          clockOutNote: "Edited by Admin",
          hours: Number(overrideTotal)
        }];
        updateData.totalHours = Number(overrideTotal);
      }

      await adminDb.collection("attendance").doc(docId).update(updateData);
      return Response.json({ success: true });
    }

    // Normal Clock In/Out flow
    if (action === "clockIn") {
      // Check if already clocked in today
      const existingQuery = await adminDb.collection("attendance")
        .where("email", "==", email)
        .where("date", "==", today)
        .limit(1)
        .get();

      const newSession = {
        clockIn: timestamp,
        clockOut: null,
        clockInNote: note || "",
        clockOutNote: "",
        hours: 0
      };

      if (!existingQuery.empty) {
        const doc = existingQuery.docs[0];
        const data = doc.data();
        const sessions = data.sessions || [];
        
        // Backward-compatibility virtualization
        if (sessions.length === 0 && data.clockIn) {
          sessions.push({
            clockIn: data.clockIn,
            clockOut: data.clockOut || null,
            clockInNote: data.clockInNote || "Legacy Session",
            clockOutNote: data.clockOutNote || "",
            hours: data.totalHours || 0
          });
        }

        const activeSession = sessions.find((s: any) => !s.clockOut);
        if (activeSession || data.status === "Working") {
          return Response.json({ error: "Already clocked in and active" }, { status: 400 });
        }
        
        // Re-clocking in for a new session on the same day!
        sessions.push(newSession);
        await doc.ref.update({
          sessions,
          status: "Working",
          updatedAt: new Date().toISOString()
        });
        return Response.json({ success: true, docId: doc.id });
      }

      // First clock-in of the day
      const docRef = await adminDb.collection("attendance").add({
        email,
        name,
        date: today,
        sessions: [newSession],
        totalHours: 0,
        status: "Working",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return Response.json({ success: true, docId: docRef.id });

    } else if (action === "clockOut") {
      let docRef;
      let doc;

      if (docId) {
        docRef = adminDb.collection("attendance").doc(docId);
        doc = await docRef.get();
      } else {
        // Fallback: look for the user's active session of today
        const activeQuery = await adminDb.collection("attendance")
          .where("email", "==", email)
          .where("status", "==", "Working")
          .limit(1)
          .get();

        if (activeQuery.empty) {
          return Response.json({ error: "No active clock-in session found to clock out" }, { status: 400 });
        }
        doc = activeQuery.docs[0];
        docRef = doc.ref;
      }
      
      if (!doc.exists) return Response.json({ error: "Record not found" }, { status: 404 });
      
      const docData = doc.data();
      const sessions = docData?.sessions || [];
      
      // Virtualize legacy if empty but clockIn exists
      if (sessions.length === 0 && docData?.clockIn) {
        sessions.push({
          clockIn: docData.clockIn,
          clockOut: docData.clockOut || null,
          clockInNote: docData.clockInNote || "Legacy Session",
          clockOutNote: docData.clockOutNote || "",
          hours: docData.totalHours || 0
        });
      }

      const activeIndex = sessions.findIndex((s: any) => !s.clockOut);
      if (activeIndex === -1) {
        return Response.json({ error: "No active session found within today's record" }, { status: 400 });
      }

      const activeSession = sessions[activeIndex];
      const clockInTime = new Date(activeSession.clockIn).getTime();
      const clockOutTime = new Date(timestamp).getTime();
      const sessionHours = Number(((clockOutTime - clockInTime) / (1000 * 60 * 60)).toFixed(2));
      
      sessions[activeIndex] = {
        ...activeSession,
        clockOut: timestamp,
        clockOutNote: note || "",
        hours: sessionHours >= 0 ? sessionHours : 0
      };

      const totalHours = sessions.reduce((acc: number, s: any) => acc + Number(s.hours || 0), 0);

      await docRef.update({
        sessions,
        totalHours: Number(totalHours.toFixed(2)),
        status: "Completed",
        updatedAt: new Date().toISOString()
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/attendance error:", error);
    return Response.json({ error: error.message || "Failed to log attendance" }, { status: 500 });
  }
}

