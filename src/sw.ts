/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

self.addEventListener("install", () => { self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(self.clients.claim()); });

self.addEventListener("push", (event: PushEvent) => {
  let data: { title?: string; body?: string; url?: string; icon?: string; tag?: string } = {};
  try { data = event.data?.json() ?? {}; } catch { data = { body: event.data?.text() ?? "" }; }
  const title = data.title ?? "FietsMarkt";
  const options: NotificationOptions = {
    body: data.body ?? "",
    icon: data.icon ?? "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag,
    data: { url: data.url ?? "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | null)?.url ?? "/";
  event.waitUntil((async () => {
    const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of clientList) {
      if ("focus" in c) { (c as WindowClient).navigate(url); return (c as WindowClient).focus(); }
    }
    return self.clients.openWindow(url);
  })());
});
