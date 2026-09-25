/**
 * useReminderNotifications
 * Pure browser Notification API — no FCM / service worker changes needed.
 * Fires on app mount from Dashboard.
 */

const STORAGE_KEY_LAST_WEEKLY = "kkn:lastWeeklyReminder";
const STORAGE_KEY_ENABLED = "kkn:remindersEnabled";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function isNotificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationsSupported()) return "denied";
  return Notification.requestPermission();
}

export function areRemindersEnabled(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_ENABLED) === "true";
  } catch {
    return false;
  }
}

export function setRemindersEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? "true" : "false");
  } catch {
    /* noop */
  }
}

function sendNotification(title: string, body: string, icon = "/icon-192.png") {
  if (getNotificationPermission() !== "granted") return;
  try {
    new Notification(title, { body, icon });
  } catch {
    /* noop — some browsers block it in non-secure contexts */
  }
}

export function fireWeeklyReminderIfDue(): void {
  if (!areRemindersEnabled()) return;
  if (getNotificationPermission() !== "granted") return;

  try {
    const last = parseInt(localStorage.getItem(STORAGE_KEY_LAST_WEEKLY) || "0", 10);
    const now = Date.now();
    if (now - last >= ONE_WEEK_MS) {
      sendNotification(
        "🌾 ખેડૂત ખર્ચ — આ અઠવાડિયાની નોંધ?",
        "આ અઠવાડિયાનો ખર્ચ નોંધ્યો? ટૅપ કરો અને અપડેટ કરો."
      );
      localStorage.setItem(STORAGE_KEY_LAST_WEEKLY, String(now));
    }
  } catch {
    /* noop */
  }
}

export function fireMembershipReminderIfDue(expiresAt: number | undefined): void {
  if (!areRemindersEnabled()) return;
  if (getNotificationPermission() !== "granted") return;
  if (!expiresAt) return;

  const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
  if (expiresAt <= sevenDaysFromNow && expiresAt > Date.now()) {
    const daysLeft = Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
    sendNotification(
      "⚠️ સભ્યપદ સમાપ્ત થવાની તૈયારીમાં",
      `તમારું સભ્યપદ ${daysLeft} દિવસ${daysLeft === 1 ? "" : ""} માં સમાપ્ત થશે. નવીકરણ કરો.`
    );
  }
}

export function sendTestNotification(): void {
  sendNotification(
    "✅ ખેડૂત ખર્ચ — ટેસ્ટ",
    "સૂચના યોગ્ય રીતે કામ કરી રહી છે!"
  );
}
