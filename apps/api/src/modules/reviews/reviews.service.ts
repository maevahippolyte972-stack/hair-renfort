import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AssignmentStatus } from "@hair-renfort/db";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateReviewDto } from "./dto/create-review.dto";

/** Avis bilatéral détaillé par critère, uniquement en fin de mission (statut TERMINEE). */
@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(
    actorUserId: string,
    actorType: "SALON" | "FREELANCE",
    assignmentId: string,
    dto: CreateReviewDto,
  ) {
    const assignment = await this.prisma.missionAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        freelance: { include: { user: true } },
        missionNeed: { include: { salon: { include: { user: true } } } },
      },
    });
    if (!assignment) throw new NotFoundException("Mission introuvable.");
    if (assignment.status !== AssignmentStatus.TERMINEE) {
      throw new BadRequestException("L'avis n'est possible qu'une fois la mission terminée par les deux parties.");
    }

    const salonUserId = assignment.missionNeed.salon.user.id;
    const freelanceUserId = assignment.freelance.user.id;

    if (actorType === "SALON" && actorUserId !== salonUserId) throw new ForbiddenException();
    if (actorType === "FREELANCE" && actorUserId !== freelanceUserId) throw new ForbiddenException();

    const targetUserId = actorType === "SALON" ? freelanceUserId : salonUserId;

    return this.prisma.review.create({
      data: {
        missionAssignmentId: assignmentId,
        authorUserId: actorUserId,
        targetUserId,
        ponctualite: dto.ponctualite,
        technique: dto.technique,
        relationnel: dto.relationnel,
        commentaire: dto.commentaire,
      },
    });
  }
}
