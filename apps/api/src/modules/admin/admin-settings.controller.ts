import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { UserRole } from "@hair-renfort/db";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { PrismaService } from "../../prisma/prisma.service";
import { UpdateSettingDto } from "./dto/update-setting.dto";

/**
 * Seuils métier modifiables sans déploiement (urgence, sanctions d'annulation, cohortes
 * d'amorçage) — brief, "Points ouverts à trancher avant développement" : la fondatrice
 * tranche les valeurs, le back-office les applique immédiatement.
 */
@Controller("admin/settings")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminSettingsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.platformSetting.findMany();
  }

  @Put(":key")
  async update(@CurrentUser() admin: AuthenticatedUser, @Param("key") key: string, @Body() dto: UpdateSettingDto) {
    const updated = await this.prisma.platformSetting.upsert({
      where: { key },
      update: { value: dto.value as any, updatedByAdminId: admin.userId },
      create: { key, value: dto.value as any, updatedByAdminId: admin.userId },
    });
    await this.prisma.adminActionLog.create({
      data: { adminId: admin.userId, action: "UPDATE_SETTING", targetType: "PlatformSetting", targetId: key, metadata: dto.value as any },
    });
    return updated;
  }
}
