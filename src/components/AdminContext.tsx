"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

interface AdminContextType {
  user: User | null;
  isAdmin: boolean;
  role: string;
  allowDelete: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType>({
  user: null,
  isAdmin: false,
  role: "guest",
  allowDelete: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<string>("staff");
  const [allowDelete, setAllowDelete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser?.email) {
        try {
          const adminsRef = collection(db, "admins");
          const q = query(adminsRef, where("email", "==", firebaseUser.email));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setIsAdmin(true);
            const userRole = data.role || "staff";
            setRole(userRole);
            setAllowDelete(userRole === "admin" || userRole === "superadmin" || !!data.allowDelete);
          } else {
            // Fallback: Check if user exists in 'students' collection
            const studentsRef = collection(db, "students");
            const sq = query(studentsRef, where("email", "==", firebaseUser.email));
            const studentSnapshot = await getDocs(sq);
            if (!studentSnapshot.empty) {
              setIsAdmin(true);
              setRole("student");
              setAllowDelete(false);
            } else {
              setIsAdmin(false);
              setRole("guest");
              setAllowDelete(false);
            }
          }
        } catch (err) {
          console.error("Admin check failed:", err);
          setIsAdmin(false);
          setRole("guest");
          setAllowDelete(false);
        }
      } else {
        setIsAdmin(false);
        setRole("guest");
        setAllowDelete(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setIsAdmin(false);
    setAllowDelete(false);
  }, []);

  return (
    <AdminContext.Provider value={{ user, isAdmin, role, allowDelete, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}

export default AdminContext;
