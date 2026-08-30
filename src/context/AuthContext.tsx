import {
  
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import imageCompression from "browser-image-compression";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  browserLocalPersistence,
  type AuthError,
  type User,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import type { UserMembership, MembershipStatus } from "../types";
import { ADMIN_EMAIL } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  membership: UserMembership | null;
  membershipLoading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  submitMembershipPayment: (opts: {
    paymentProofFile: File;
    paymentMethod: string;
    paymentReference: string;
    paymentAmount: number;
  }) => Promise<void>;
  skipDonation: () => Promise<void>;
}

async function saveUserProfile(user: User) {
  try {
    const userProfile = {
      uid: user.uid,
      name: user.displayName ?? null,
      email: user.email ?? null,
      photoURL: user.photoURL ?? null,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", user.uid), userProfile, { merge: true });
  } catch (error: unknown) {
    console.error("Failed to save user profile to Firestore:", error);
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);

  const isAdmin = useMemo(
    () => !!(user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()),
    [user]
  );

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        if (nextUser) saveUserProfile(nextUser);
        setUser(nextUser);
        setLoading(false);
        if (!nextUser) {
          setMembership(null);
          setMembershipLoading(false);
        }
      },
      () => {
        setUser(null);
        setLoading(false);
        setMembership(null);
        setMembershipLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // Real-time Firestore listener for membership fields
  useEffect(() => {
    if (!user) return;

    setMembershipLoading(true);
    const userDocRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      async (snap) => {
        if (!snap.exists()) {
          setMembership(null);
          setMembershipLoading(false);
          return;
        }

        const data = snap.data();

        // Build membership object from Firestore doc
        const raw: Partial<UserMembership> = {
          membershipStatus: (data.membershipStatus as MembershipStatus) ?? undefined,
          membershipType: "Annual",
          membershipAmount: 300,
          paymentProof: data.paymentProof ?? undefined,
          paymentMethod: data.paymentMethod ?? undefined,
          paymentReference: data.paymentReference ?? undefined,
          paymentSubmittedAt: data.paymentSubmittedAt?.toMillis?.() ?? data.paymentSubmittedAt ?? undefined,
          membershipStartedAt: data.membershipStartedAt?.toMillis?.() ?? data.membershipStartedAt ?? undefined,
          membershipExpiresAt: data.membershipExpiresAt?.toMillis?.() ?? data.membershipExpiresAt ?? undefined,
          membershipApprovedAt: data.membershipApprovedAt?.toMillis?.() ?? data.membershipApprovedAt ?? undefined,
          approvedBy: data.approvedBy ?? undefined,
          renewalCount: typeof data.renewalCount === "number" ? data.renewalCount : 0,
        };

        // Auto-expire: if Active but expiry has passed, update Firestore and local state
        if (
          raw.membershipStatus === "Active" &&
          raw.membershipExpiresAt &&
          raw.membershipExpiresAt < Date.now()
        ) {
          raw.membershipStatus = "Expired";
          try {
            await updateDoc(userDocRef, { membershipStatus: "Expired" });
          } catch (err) {
            console.error("Failed to auto-expire membership:", err);
          }
        }

        // Only expose membership object if a status exists
        if (raw.membershipStatus) {
          setMembership(raw as UserMembership);
        } else {
          setMembership(null);
        }

        setMembershipLoading(false);
      },
      (error) => {
        console.error("Membership listener error:", error);
        setMembership(null);
        setMembershipLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await setPersistence(auth, browserLocalPersistence);
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUserProfile(result.user);
    } catch (error: unknown) {
      const code = (error as AuthError)?.code;
      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/operation-not-supported-in-this-environment"
      ) {
        await signInWithRedirect(auth, provider);
      } else {
        throw error;
      }
    }
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const submitMembershipPayment = useCallback(
    async ({
      paymentProofFile,
      paymentMethod,
      paymentReference,
      paymentAmount,
    }: {
      paymentProofFile: File;
      paymentMethod: string;
      paymentReference: string;
      paymentAmount: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      let fileToUpload = paymentProofFile;
      if (paymentProofFile.type.startsWith("image/")) {
        try {
          const options = {
            maxSizeMB: 0.2,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
          };
          fileToUpload = await imageCompression(paymentProofFile, options);
        } catch (err) {
          console.error("Image compression error:", err);
        }
      }

      // Convert proof to base64
      const proofURL = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileToUpload);
      });

      // Current membership data for renewal count
      const currentCount = membership?.renewalCount ?? 0;
      const isRenewal = membership?.membershipStatus === "Expired" || membership?.membershipStatus === "Rejected";

      await updateDoc(doc(db, "users", user.uid), {
        membershipStatus: "Pending",
        membershipType: "Annual",
        membershipAmount: paymentAmount,
        paymentProof: proofURL,
        paymentMethod,
        paymentReference,
        paymentSubmittedAt: serverTimestamp(),
        renewalCount: isRenewal ? currentCount + 1 : currentCount,
        // Clear previous approval fields on new submission
        membershipStartedAt: null,
        membershipExpiresAt: null,
        membershipApprovedAt: null,
        approvedBy: null,
      });
    },
    [user, membership]
  );

  const skipDonation = useCallback(async () => {
    if (!user) throw new Error("Not authenticated");

    // Write to Firestore
    await setDoc(doc(db, "users", user.uid), {
      membershipStatus: "Active",
      membershipStartedAt: serverTimestamp(),
      membershipExpiresAt: null,
      donationStatus: "Skipped",
    }, { merge: true });

    // Optimistically update local state RIGHT NOW so that when we navigate("/")
    // the AuthGuard sees Active status immediately — without waiting for the
    // Firestore onSnapshot to fire (which can take 200-500ms, causing a redirect loop).
    setMembership((prev) => ({
      membershipType: "Annual",
      membershipAmount: 300,
      renewalCount: prev?.renewalCount ?? 0,
      ...prev,
      membershipStatus: "Active",
      membershipExpiresAt: undefined,
    } as UserMembership));
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      membership,
      membershipLoading,
      isAdmin,
      signInWithGoogle,
      signOutUser,
      submitMembershipPayment,
      skipDonation,
    }),
    [user, loading, membership, membershipLoading, isAdmin, signInWithGoogle, signOutUser, submitMembershipPayment, skipDonation]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
