import { Injectable, Logger } from "@nestjs/common";
import webpush from "web-push";
import { AccountStatus, UserRole } from "@hair-renfort/db";
import { PrismaService } from "../../prisma/prisma.service";
import { SubscribePushDto } from "./dto/subscribe-push.dto";

/**
 * Alertes "nouvelle mission" aux freelances abonnées (Web Push, VAPID). L'envoi est
 * toujours best-effort : un échec ou l'absence de clés VAPID ne bloque jamais la
 * publication d'un besoin, qui reste la seule opération critique.
 */
@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private configured = false;

  constructor(private prisma: PrismaService) {
    const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = process.env;
    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(VAPID_SUBJECT ?? "mailto:contact@hair-renfort.app", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
      this.configured = true;
    } else {
      this.logger.warn("VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY absents : alertes push désactivées.");
    }
  }

  getPublicKey() {
    return { publicKey: process.env.VAPID_PUBLIC_KEY ?? "" };
  }

  async getState(userId: string) {
    const devices = await this.prisma.pushSubscription.count({ where: { userId } });
    return { devices, disponible: this.configured };
  }

  async subscribe(userId: string, dto: SubscribePushDto) {
    await this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      update: { userId, p256dh: dto.p256dh, auth: dto.auth, userAgent: dto.userAgent },
      create: { userId, endpoint: dto.endpoint, p256dh: dto.p256dh, auth: dto.auth, userAgent: dto.userAgent },
    });
    return { ok: true };
  }

  async unsubscribeAll(userId: string) {
    await this.prisma.pushSubscription.deleteMany({ where: { userId } });
    return { ok: true };
  }

  /** Prévient les freelances actives dès qu'un salon publie un besoin. Best-effort, ne lève jamais. */
  async notifyFreelancesOfNewNeed(need: { specialtyLabel: string; salonNom: string; ville: string; urgencyLevel: "NORMAL" | "URGENT" | "TRES_URGENT" }) {
    if (!this.configured) return { sent: 0 };

    const subs = await this.prisma.pushSubscription.findMany({
      where: { user: { role: UserRole.FREELANCE, status: AccountStatus.ACTIVE } },
    });
    if (subs.length === 0) return { sent: 0 };

    const isUrgent = need.urgencyLevel !== "NORMAL";
    const title = isUrgent
      ? `${need.urgencyLevel === "TRES_URGENT" ? "Très urgent" : "Urgent"} · ${need.specialtyLabel}`
      : `Nouvelle mission · ${need.specialtyLabel}`;
    const payload = JSON.stringify({
      title,
      body: `${need.salonNom} à ${need.ville} cherche un renfort. Vous fixez votre tarif.`,
      url: "/app/decouvrir",
      tag: "mission",
    });

    let sent = 0;
    const stale: string[] = [];
    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
            { urgency: isUrgent ? "high" : "normal" },
          );
          sent += 1;
        } catch (err: unknown) {
          const statusCode = (err as { statusCode?: number })?.statusCode;
          if (statusCode === 404 || statusCode === 410) stale.push(sub.id);
          else this.logger.warn(`Envoi push échoué (${sub.id}): ${(err as Error)?.message ?? err}`);
        }
      }),
    );

    if (stale.length > 0) await this.prisma.pushSubscription.deleteMany({ where: { id: { in: stale } } });
    return { sent };
  }
}
