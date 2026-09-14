import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/** "Retravailler ensemble" — jamais bloquant vis-à-vis de la non-exclusivité, simple raccourci. */
@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async add(salonProfileId: string, freelanceProfileId: string) {
    return this.prisma.favorite.upsert({
      where: { salonId_freelanceId: { salonId: salonProfileId, freelanceId: freelanceProfileId } },
      update: {},
      create: { salonId: salonProfileId, freelanceId: freelanceProfileId },
    });
  }

  async remove(salonProfileId: string, freelanceProfileId: string) {
    await this.prisma.favorite.deleteMany({
      where: { salonId: salonProfileId, freelanceId: freelanceProfileId },
    });
  }

  async listMine(salonProfileId: string) {
    return this.prisma.favorite.findMany({
      where: { salonId: salonProfileId },
      include: { freelance: true },
    });
  }
}
