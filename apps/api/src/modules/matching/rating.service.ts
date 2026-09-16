import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export interface CriteriaAverages {
  overall: number;
  ponctualite: number;
  technique: number;
  relationnel: number;
  avisCount: number;
}

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

  /** Brief : "notes détaillées par critère (ponctualité/technique/relationnel)" —
   * jamais un seul score fondu, pour que chaque critère reste explicable. */
  async getCriteriaAverages(targetUserId: string): Promise<CriteriaAverages | null> {
    const reviews = await this.prisma.review.findMany({ where: { targetUserId } });
    if (reviews.length === 0) return null;
    const n = reviews.length;
    const round1 = (v: number) => Math.round(v * 10) / 10;
    const ponctualite = round1(reviews.reduce((a, r) => a + r.ponctualite, 0) / n);
    const technique = round1(reviews.reduce((a, r) => a + r.technique, 0) / n);
    const relationnel = round1(reviews.reduce((a, r) => a + r.relationnel, 0) / n);
    return {
      overall: round1((ponctualite + technique + relationnel) / 3),
      ponctualite,
      technique,
      relationnel,
      avisCount: n,
    };
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
