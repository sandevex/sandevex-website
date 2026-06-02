import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // If credentials are not configured, initialize without them
  // This allows the build to succeed; runtime calls will fail gracefully
  if (!projectId || !clientEmail || !privateKey || privateKey.includes("your-private-key-here")) {
    try {
      return initializeApp({ projectId: projectId || "demo-project" });
    } catch {
      return initializeApp({ projectId: "demo-project" });
    }
  }

  const serviceAccount: ServiceAccount = {
    projectId,
    clientEmail,
    privateKey,
  };

  return initializeApp({ credential: cert(serviceAccount) });
}

const app = initializeFirebaseAdmin();

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
export default app;
