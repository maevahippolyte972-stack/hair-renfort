import { Injectable } from "@nestjs/common";
import { AssignmentStatus } from "@hair-renfort/db";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Disponibilité réelle = calculée depuis les missions déjà ACCEPTEES (jamais une saisie
 * manuelle de la freelance). Granularité jour (une freelance engagée un jour donné est
 * considérée indisponible ce jour-là, quel que soit le créneau horaire précis).
 */
@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async getBusyDates(freelanceId: string): Promise<Set<string>> {
    const accepted = await this.prisma.missionAssignment.findMany({
      where: { freelanceId, status: AssignmentStatus.ACCEPTEE },
      include: { missionNeed: { include: { slots: true } } },
    });
    const busy = new Set<string>();
    for (const a of accepted) {
      for (const slot of a.missionNeed.slots) {
        busy.add(slot.date.toISOString().slice(0, 10));
      }
    }
    return busy;
  }

  async isAvailableForDates(freelanceId: string, dates: Date[]): Promise<boolean> {
    const busy = await this.getBusyDates(freelanceId);
    return dates.every((d) => !busy.has(d.toISOString().slice(0, 10)));
  }

  /** Filtre en masse : conserve uniquement les freelanceId disponibles pour toutes les dates. */
  async filterAvailable(freelanceIds: string[], dates: Date[]): Promise<Set<string>> {
    const results = await Promise.all(
      freelanceIds.map(async (id) => [id, await this.isAvailableForDates(id, dates)] as const),
    );
    return new Set(results.filter(([, available]) => available).map(([id]) => id));
  }
}
