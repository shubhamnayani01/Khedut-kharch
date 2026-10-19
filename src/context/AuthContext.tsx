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
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  updateEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type AuthError,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import type { UserMembership, MembershipStatus, UserProfile } from "../types";
import { ADMIN_EMAILS } from "../types";
import emailjs from "@emailjs/browser";
import { EMAILJS_CONFIG, EMAIL_ENABLED } from "../lib/emailConfig";

async function notifyAdminPaymentEmail(name: string, email: string, amount: number, method: string, reference: string) {
  if (!EMAIL_ENABLED) return;
  try {
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      {
        user_name: name,
        user_email: email,
        amount: `₹${amount}`,
        method: method || "N/A",
        reference: reference || "N/A",
        time: new Date().toLocaleString("gu-IN"),
        to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
      },
      EMAILJS_CONFIG.PUBLIC_KEY
    );
  } catch (err) {
    console.error("Direct EmailJS payment notification failed:", err);
  }
}

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  membership: UserMembership | null;
  membershipLoading: boolean;
  isAdmin: boolean;
  isInTrial: boolean; // Retained as "Free" user status
  isPremium: boolean;
  signInWithGoogle: () => Promise<void>;
  sendEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, otp: string) => Promise<User>;
  setUpRecaptcha: (containerId: string) => RecaptchaVerifier;
  sendPhoneOtp: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (confirmationResult: ConfirmationResult, otp: string) => Promise<User>;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
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
    const userDocRef = doc(db, "users", user.uid);
    const snap = await getDoc(userDocRef);
    const existing = snap.data();

    const userProfile = {
      uid: user.uid,
      name: user.displayName ?? existing?.name ?? (user.phoneNumber ? `ખેડૂત (${user.phoneNumber.slice(-4)})` : null),
      phoneNumber: user.phoneNumber ?? existing?.phoneNumber ?? null,
      email: user.email ?? existing?.email ?? null,
      photoURL: user.photoURL ?? existing?.photoURL ?? null,
      authProvider: user.providerData?.some(p => p.providerId === "google.com") ? "google.com" : (existing?.authProvider ?? "email"),
      lastLoginAt: serverTimestamp(),
      ...(snap.exists() ? {} : { createdAt: serverTimestamp(), hasCompletedProfile: false }),
    };
    await setDoc(userDocRef, userProfile, { merge: true });
  } catch (error: unknown) {
    console.error("Failed to save user profile to Firestore:", error);
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);

  const effectiveEmail = user?.email || userProfile?.email || (typeof window !== "undefined" ? localStorage.getItem("khedut_verified_email") : null);

  const isAdmin = useMemo(
    () => !!(effectiveEmail && ADMIN_EMAILS.some(e => e.toLowerCase() === effectiveEmail.toLowerCase())),
    [effectiveEmail]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        if (nextUser) saveUserProfile(nextUser);
        setUser(nextUser);
        setLoading(false);
        if (!nextUser) {
          setUserProfile(null);
          setMembership(null);
          setMembershipLoading(false);
        }
      },
      () => {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        setMembership(null);
        setMembershipLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  // Sync user profile & membership from Firestore
  useEffect(() => {
    if (!user) return;

    setMembershipLoading(true);
    const userDocRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      async (snap) => {
        if (!snap.exists()) {
          setUserProfile(null);
          setMembership(null);
          setMembershipLoading(false);
          return;
        }

        const data = snap.data();

        // Sync User Profile
        setUserProfile({
          uid: user.uid,
          name: data.name ?? user.displayName ?? null,
          phoneNumber: data.phoneNumber ?? user.phoneNumber ?? null,
          email: data.email ?? user.email ?? null,
          age: typeof data.age === "number" ? data.age : null,
          village: data.village ?? null,
          taluka: data.taluka ?? null,
          district: data.district ?? null,
          landSizeAcres: typeof data.landSizeAcres === "number" ? data.landSizeAcres : null,
          hasCompletedProfile: data.hasCompletedProfile === true,
          photoURL: data.photoURL ?? user.photoURL ?? null,
        });

        if (!data.membershipStatus) {
          try {
            await updateDoc(userDocRef, {
              membershipStatus: "Trial",
              trialStartedAt: serverTimestamp(),
              membershipType: "Annual",
              membershipAmount: 300,
              renewalCount: 0,
            });
          } catch (err) {
            console.error("Failed to start trial:", err);
          }
          return;
        }

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
          donationStatus: data.donationStatus ?? undefined,
          trialStartedAt: data.trialStartedAt?.toMillis?.() ?? data.trialStartedAt ?? undefined,
        };

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

        if (raw.membershipStatus) {
          setMembership(raw as UserMembership);
        } else {
          setMembership(null);
        }

        setMembershipLoading(false);
      },
      (error) => {
        console.error("Membership/profile listener error:", error);
        setMembership(null);
        setMembershipLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const setUpRecaptcha = useCallback((containerId: string) => {
    // Clear any previous instance on the element
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = "";
    }
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved
      },
    });
    return verifier;
  }, []);

  const sendPhoneOtp = useCallback(async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
    await setPersistence(auth, browserLocalPersistence);
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  }, []);

  const verifyPhoneOtp = useCallback(async (confirmationResult: ConfirmationResult, otp: string) => {
    const cred = await confirmationResult.confirm(otp);
    await saveUserProfile(cred.user);
    return cred.user;
  }, []);

  const checkEmailProvider = useCallback(async (email: string): Promise<"google" | "email" | "none"> => {
    const cleanEmail = email.trim().toLowerCase();
    // 1. Check if known Google admin
    if (ADMIN_EMAILS.some(e => e.toLowerCase() === cleanEmail)) {
      return "google";
    }
    // 2. Check Firestore user profile
    try {
      const q = query(collection(db, "users"), where("email", "==", cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const u = snap.docs[0].data();
        if (u.photoURL || u.authProvider === "google.com") {
          return "google";
        }
      }
    } catch {
      // ignore
    }
    return "none";
  }, []);

  const sendEmailOtp = useCallback(async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check if user is an existing Google user
    const provider = await checkEmailProvider(cleanEmail);
    if (provider === "google") {
      throw new Error("GOOGLE_ACCOUNT_EXISTS");
    }

    // Generate secure 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in Firestore
    const otpDocRef = doc(db, "email_otps", cleanEmail);
    await setDoc(otpDocRef, {
      email: cleanEmail,
      otp,
      expiresAt,
      createdAt: serverTimestamp(),
    });

    // Send email via EmailJS template_9jcsssy
    // Provide common recipient variable names (to_email, user_email, email) so template matches
    const templateParams = {
      to_email: cleanEmail,
      user_email: cleanEmail,
      email: cleanEmail,
      to_name: cleanEmail.split("@")[0],
      passcode: otp,
      otp_code: otp,
      otp: otp,
      time: new Date().toLocaleString("gu-IN"),
    };

    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.OTP_TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
  }, [checkEmailProvider]);

  const verifyEmailOtp = useCallback(async (email: string, otpInput: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const otpDocRef = doc(db, "email_otps", cleanEmail);
    const snap = await getDoc(otpDocRef);

    if (!snap.exists()) {
      throw new Error("OTP_NOT_FOUND");
    }

    const data = snap.data();
    if (Date.now() > data.expiresAt) {
      throw new Error("OTP_EXPIRED");
    }

    if (data.otp !== otpInput.trim()) {
      throw new Error("OTP_INVALID");
    }

    // OTP matched! Clean up the used OTP
    await setDoc(otpDocRef, { otp: null, expired: true }, { merge: true });

    await setPersistence(auth, browserLocalPersistence);

    // Check if user already exists in Firestore under this email (e.g. from Google login)
    let existingUid: string | null = null;
    let existingData: Record<string, unknown> | null = null;
    try {
      const q = query(collection(db, "users"), where("email", "==", cleanEmail));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const firstDoc = querySnap.docs[0];
        existingUid = firstDoc.id;
        existingData = firstDoc.data();
      }
    } catch (e) {
      console.warn("Could not check existing email profile:", e);
    }

    let authenticatedUser: User;
    const cleanPrefix = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    const syntheticPassword = `Kh_${cleanPrefix}_9988#khedut!`;

    try {
      // First try to sign in directly with the known synthetic password
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, syntheticPassword);
      authenticatedUser = cred.user;
    } catch (signInErr: unknown) {
      const code = (signInErr as { code?: string })?.code;
      // If user doesn't exist yet, create account with the synthetic password
      if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
        try {
          const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, syntheticPassword);
          authenticatedUser = newCred.user;
        } catch (createErr: unknown) {
          const createCode = (createErr as { code?: string })?.code;
          if (createCode === "auth/email-already-in-use") {
            try {
              const cred = await signInWithEmailAndPassword(auth, cleanEmail, syntheticPassword);
              authenticatedUser = cred.user;
            } catch {
              const anonCred = await signInAnonymously(auth);
              await updateProfile(anonCred.user, { displayName: (existingData?.name as string) ?? cleanEmail.split("@")[0] });
              authenticatedUser = anonCred.user;
            }
          } else {
            const anonCred = await signInAnonymously(auth);
            authenticatedUser = anonCred.user;
          }
        }
      } else {
        const anonCred = await signInAnonymously(auth);
        authenticatedUser = anonCred.user;
      }
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("khedut_verified_email", cleanEmail);
    }

    try {
      await updateEmail(authenticatedUser, cleanEmail);
    } catch {
      // updateEmail might fail if email provider conflict, handled gracefully
    }

    // Determine the target UID to save profile to:
    // If they already had a previous UID from Google login, keep and update their existing data!
    const targetUid = authenticatedUser.uid;
    const userDocRef = doc(db, "users", targetUid);

    await setDoc(userDocRef, {
      ...(existingData ?? {}),
      uid: targetUid,
      email: cleanEmail,
      name: (existingData?.name as string) ?? authenticatedUser.displayName ?? cleanEmail.split("@")[0],
      membershipStatus: (existingData?.membershipStatus as string) ?? "Trial",
      lastLoginAt: serverTimestamp(),
    }, { merge: true });

    // Update local state immediately so user sees email and admin right away
    setUserProfile({
      uid: targetUid,
      name: (existingData?.name as string) ?? authenticatedUser.displayName ?? cleanEmail.split("@")[0],
      email: cleanEmail,
      phoneNumber: (existingData?.phoneNumber as string) ?? null,
      age: (existingData?.age as number) ?? null,
      village: (existingData?.village as string) ?? null,
      taluka: (existingData?.taluka as string) ?? null,
      district: (existingData?.district as string) ?? null,
      landSizeAcres: (existingData?.landSizeAcres as number) ?? null,
      hasCompletedProfile: true,
      photoURL: authenticatedUser.photoURL ?? null,
    });

    // If an existing Google account existed under another UID, sync seasons and expenses over
    if (existingUid && existingUid !== targetUid) {
      try {
        const subcollections = ["seasons", "expenses", "workers", "bhaagidars", "advanceLedgers", "inventoryItems", "documents"];
        for (const colName of subcollections) {
          const subSnap = await getDocs(collection(db, "users", existingUid, colName));
          for (const itemDoc of subSnap.docs) {
            await setDoc(doc(db, "users", targetUid, colName, itemDoc.id), itemDoc.data(), { merge: true });
          }
        }
      } catch (mergeErr) {
        console.warn("Subcollection sync warning:", mergeErr);
      }
    }

    return authenticatedUser;
  }, []);

  const updateUserProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    if (!user) throw new Error("User not authenticated");
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      ...profileData,
      hasCompletedProfile: true,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    setUserProfile((prev) => (prev ? { ...prev, ...profileData, hasCompletedProfile: true } : null));
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
        membershipStartedAt: null,
        membershipExpiresAt: null,
        membershipApprovedAt: null,
        approvedBy: null,
      });

      // Send email notification to admin immediately upon payment submission
      void notifyAdminPaymentEmail(
        user.displayName ?? user.email ?? "Unknown User",
        user.email ?? "No Email",
        paymentAmount,
        paymentMethod,
        paymentReference
      );
    },
    [user, membership]
  );

  const skipDonation = useCallback(async () => {
    if (!user) throw new Error("Not authenticated");

    await setDoc(doc(db, "users", user.uid), {
      membershipStatus: "Active",
      membershipStartedAt: serverTimestamp(),
      membershipExpiresAt: null,
      donationStatus: "Skipped",
    }, { merge: true });

      setMembership((prev) => ({
      membershipType: "Annual",
      membershipAmount: 300,
      renewalCount: prev?.renewalCount ?? 0,
      ...prev,
      membershipStatus: "Active",
      membershipExpiresAt: undefined,
      donationStatus: "Skipped",
    } as UserMembership));
  }, [user]);

  const isInTrial = !isAdmin && membership?.membershipStatus === "Trial";
  const isPremium = isAdmin || membership?.membershipStatus === "Active";

  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      membership,
      membershipLoading,
      isAdmin,
      isInTrial,
      isPremium,
      signInWithGoogle,
      sendEmailOtp,
      verifyEmailOtp,
      setUpRecaptcha,
      sendPhoneOtp,
      verifyPhoneOtp,
      updateUserProfile,
      signOutUser,
      submitMembershipPayment,
      skipDonation,
    }),
    [
      user,
      userProfile,
      loading,
      membership,
      membershipLoading,
      isAdmin,
      isInTrial,
      isPremium,
      signInWithGoogle,
      sendEmailOtp,
      verifyEmailOtp,
      setUpRecaptcha,
      sendPhoneOtp,
      verifyPhoneOtp,
      updateUserProfile,
      signOutUser,
      submitMembershipPayment,
      skipDonation,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
