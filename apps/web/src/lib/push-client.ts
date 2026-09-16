import { authFetch } from "./session";

/** Abonnement du navigateur aux alertes "nouvelle mission" (fonctionne sur téléphone, une fois l'app ajoutée à l'écran d'accueil). */

function keyToBytes(base64Url: string) {
  const padded = base64Url.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (base64Url.length % 4)) % 4);
  const raw = window.atob(padded);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

export const alertsSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

interface PushState {
  devices: number;
  disponible: boolean;
}

export async function getAlertState() {
  return authFetch<PushState>("/notifications/push/etat");
}

export async function enableMissionAlerts() {
  if (!alertsSupported()) {
    throw new Error("Ce navigateur ne prend pas encore en charge les alertes. Sur iPhone, ajoutez d'abord Hair'Renfort à votre écran d'accueil.");
  }

  const { publicKey } = await authFetch<{ publicKey: string }>("/notifications/push/cle-publique");
  if (!publicKey) throw new Error("Les alertes ne sont pas encore configurées côté serveur.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Vous avez refusé les notifications. Vous pouvez les autoriser plus tard dans les réglages du téléphone.");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyToBytes(publicKey),
    }));

  const json = subscription.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) throw new Error("L'abonnement n'a pas pu être créé.");

  await authFetch("/notifications/push/abonner", {
    method: "POST",
    body: JSON.stringify({ endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth, userAgent: navigator.userAgent }),
  });
}

export async function disableMissionAlerts() {
  if (alertsSupported()) {
    const registration = await navigator.serviceWorker.getRegistration("/sw.js");
    const subscription = await registration?.pushManager.getSubscription();
    await subscription?.unsubscribe();
  }
  await authFetch("/notifications/push/desabonner", { method: "POST" });
}
