import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { NeedStatus } from "@hair-renfort/db";
import { PrismaService } from "../../prisma/prisma.service";
import { UrgencyService } from "./urgency.service";
import { CreateNeedDto } from "./dto/create-need.dto";

@Injectable()
export class NeedsService {
  constructor(
    private prisma: PrismaService,
    private urgencyService: UrgencyService,
  ) {}

  async create(salonProfileId: string, dto: CreateNeedDto) {
    const specialty = await this.prisma.freelanceSpecialty.findUnique({
      where: { name: dto.specialtyName },
    });
    if (!specialty) throw new BadRequestException("Spécialité inconnue.");

    const slotDates = dto.slots.map((s) => new Date(s.date));
    const earliest = slotDates.sort((a, b) => a.getTime() - b.getTime())[0];
    const thresholds = await this.urgencyService.getThresholds();
    const hoursUntil = (earliest.getTime() - Date.now()) / (1000 * 60 * 60);
    const urgencyLevel = this.urgencyService.computeLevel(hoursUntil, thresholds);

    return this.prisma.missionNeed.create({
      data: {
        salonId: salonProfileId,
        specialtyId: specialty.id,
        description: dto.description,
        urgencyLevel,
        slots: {
          create: dto.slots.map((s) => ({
            date: new Date(s.date),
            heureDebut: s.heureDebut,
            heureFin: s.heureFin,
          })),
        },
      },
      include: { slots: true, specialty: true },
    });
  }

  async listMine(salonProfileId: string) {
    return this.prisma.missionNeed.findMany({
      where: { salonId: salonProfileId },
      include: { slots: true, specialty: true, assignments: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async cancel(salonProfileId: string, needId: string) {
    const need = await this.prisma.missionNeed.findUnique({ where: { id: needId } });
    if (!need) throw new NotFoundException("Besoin introuvable.");
    if (need.salonId !== salonProfileId) throw new ForbiddenException();
    if (need.status !== NeedStatus.OUVERT) {
      throw new BadRequestException("Seul un besoin encore ouvert peut être annulé directement.");
    }
    return this.prisma.missionNeed.update({
      where: { id: needId },
      data: { status: NeedStatus.ANNULE },
    });
  }
}
