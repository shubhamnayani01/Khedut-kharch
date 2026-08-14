import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import type { UserDocument } from "../types";

export function useWalletDocuments() {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users", user.uid, "documents"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
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

    return () => unsubscribe();
  }, []);

  return { documents, loading };
}
