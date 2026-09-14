import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/** Note de qualité moyenne (ponctualité/technique/relationnel) — TOUJOURS distincte du
 * taux de fiabilité, qui vit sur le profil (reliabilityScore) et ne dépend jamais des Review. */
@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}

  async getAverageRating(targetUserId: string): Promise<number | null> {
    const reviews = await this.prisma.review.findMany({ where: { targetUserId } });
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + (r.ponctualite + r.technique + r.relationnel) / 3, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  async getAverageRatingsBulk(targetUserIds: string[]): Promise<Map<string, number>> {
    if (targetUserIds.length === 0) return new Map();
    const reviews = await this.prisma.review.findMany({ where: { targetUserId: { in: targetUserIds } } });
    const byUser = new Map<string, number[]>();
    for (const r of reviews) {
      const arr = byUser.get(r.targetUserId) ?? [];
      arr.push((r.ponctualite + r.technique + r.relationnel) / 3);
      byUser.set(r.targetUserId, arr);
    }
    const result = new Map<string, number>();
    for (const [userId, scores] of byUser) {
      result.set(userId, Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10);
    }
    return result;
  }
}
