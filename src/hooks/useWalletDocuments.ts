import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";
import type { UserDocument } from "../types";

export function useWalletDocuments() {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Re-subscribe whenever the auth user changes (handles sign-out → sign-in without unmount)
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setDocuments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const q = query(
        collection(db, "users", user.uid, "documents"),
        orderBy("createdAt", "desc")
      );

      const unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })) as UserDocument[];
          setDocuments(docs);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching documents:", error);
          setLoading(false);
        }
      );

      // Return the snapshot unsubscribe so it's cleaned up when user changes
      return unsubscribeSnapshot;
    });

    return () => unsubscribeAuth();
  }, []);

  return { documents, loading };
}
