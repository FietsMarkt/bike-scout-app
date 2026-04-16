// Web Push helpers — VAPID public key is safe to expose.
import { supabase } from "@/integrations/supabase/client";

export const VAPID_PUBLIC_KEY =
  "BPeBxODkgt2LEO7plR24sNB8Uh2NKGEEn4viDFOSv_EcMfjqBRirU5ZBKNZVXmBNLy354IW1v3R9zJOuklswo54";

const urlBase64ToUint8Array = (base64: string) => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
};

export const isPushSupported = () =>
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

export const getPushPermission = (): NotificationPermission =>
  isPushSupported() ? Notification.permission : "denied";

export const subscribeToPush = async (userId: string): Promise<boolean> => {
  if (!isPushSupported()) return false;
  const reg = await navigator.serviceWorker.ready;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    }));

  const json = sub.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return false;

  await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth_key: json.keys.auth,
      user_agent: navigator.userAgent.slice(0, 200),
    },
    { onConflict: "endpoint" },
  );
  return true;
};

export const unsubscribeFromPush = async (): Promise<void> => {
  if (!isPushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
    await sub.unsubscribe();
  }
};
