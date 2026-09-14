import { useEffect, useRef, useState, useCallback } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import emailjs from "@emailjs/browser";
import { EMAILJS_CONFIG, EMAIL_ENABLED } from "../lib/emailConfig";

export type AdminNotifType = "new_user" | "new_payment";

export interface AdminNotif {
  id: string;
  type: AdminNotifType;
  uid: string;
  name: string;
  email: string;
  amount?: number;
  timestamp: number;
  read: boolean;
}

function fireBrowserNotif(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: title + body,
    });
  } catch {
    // Safari may throw
  }
}

async function sendPaymentEmail(name: string, email: string, amount: number, method: string, reference: string) {
  if (!EMAIL_ENABLED) return;
  try {
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      {
        user_name: name,
        user_email: email,
        amount: `\u20b9${amount}`,
        method: method || "N/A",
        reference: reference || "N/A",
        time: new Date().toLocaleString("gu-IN"),
        to_email: EMAILJS_CONFIG.ADMIN_EMAIL,
      },
      EMAILJS_CONFIG.PUBLIC_KEY
    );
  } catch (err) {
    console.error("EmailJS send failed:", err);
  }
}

export function useAdminNotifications(isAdmin: boolean) {
  const [notifs, setNotifs] = useState<AdminNotif[]>([]);
  const seenIds = useRef(new Set<string>());

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    void requestPermission();

    const listenStart = Date.now();
    let initialBatchDone = false;
    const existingUids = new Set<string>();

    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const newNotifs: AdminNotif[] = [];

      snap.docChanges().forEach((change) => {
        const data = change.doc.data();
        const uid = change.doc.id;

        if (!initialBatchDone) {
          if (change.type === "added") existingUids.add(uid);
          return;
        }

        // New user registered
        if (change.type === "added" && !existingUids.has(uid)) {
          existingUids.add(uid);
          const notifId = `${uid}_user`;
          if (!seenIds.current.has(notifId)) {
            seenIds.current.add(notifId);
            const n: AdminNotif = {
              id: notifId,
              type: "new_user",
              uid,
              name: data.name ?? data.email ?? "Unknown",
              email: data.email ?? "",
              timestamp: Date.now(),
              read: false,
            };
            newNotifs.push(n);
            fireBrowserNotif(
              "\ud83d\udc64 \u0aa8\u0ab5\u0acb \u0aaf\u0ac1\u0a9d\u0ab0 \u0a9c\u0acb\u0aa1\u0abe\u0aaf\u0acb",
              `${n.name} (${n.email || "no email"}) \u0a8f \u0aa8\u0acb\u0aa7\u0aa3\u0ac0 \u0a95\u0ab0\u0ac0`
            );
          }
        }

        // New payment submitted
        if (change.type === "modified") {
          const submittedAt =
            data.paymentSubmittedAt?.toMillis?.() ?? data.paymentSubmittedAt ?? 0;
          if (data.membershipStatus === "Pending" && submittedAt > listenStart) {
            const notifId = `${uid}_pay_${submittedAt}`;
            if (!seenIds.current.has(notifId)) {
              seenIds.current.add(notifId);
              const n: AdminNotif = {
                id: notifId,
                type: "new_payment",
                uid,
                name: data.name ?? data.email ?? "Unknown",
                email: data.email ?? "",
                amount: data.membershipAmount ?? 300,
                timestamp: submittedAt,
                read: false,
              };
              newNotifs.push(n);
              fireBrowserNotif(
                "\ud83d\udcb0 \u0aa8\u0ab5\u0ac0 \u0a9a\u0ac2\u0a95\u0ab5\u0aa3\u0ac0 \u0ab8\u0aac\u0aae\u0abf\u0a9f \u0aa5\u0a88",
                `${n.name} \u2014 \u20b9${n.amount} \u2014 Approve / Reject \u0a95\u0ab0\u0acb`
              );
              // Send email to admin
              void sendPaymentEmail(
                n.name,
                n.email,
                n.amount ?? 300,
                data.paymentMethod ?? "",
                data.paymentReference ?? ""
              );
            }
          }
        }
      });

      if (!initialBatchDone) {
        initialBatchDone = true;
      }

      if (newNotifs.length > 0) {
        setNotifs((prev) => [...newNotifs, ...prev].slice(0, 40));
      }
    });

    return unsub;
  }, [isAdmin, requestPermission]);

  const markRead = useCallback((id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifs.filter((n) => !n.read).length;

  return { notifs, unreadCount, markRead, markAllRead };
}
