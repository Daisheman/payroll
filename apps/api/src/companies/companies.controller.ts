import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../common/current-user";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("Company Settings")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("company")
export class CompaniesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  get(@CurrentUser() user: { companyId: string }) {
    return this.prisma.company.findUnique({ where: { id: user.companyId }, include: { settings: true } });
  }

  @Patch("settings")
  @Roles("OWNER", "ADMIN")
  updateSettings(@CurrentUser() user: { companyId: string }, @Body() body: { payrollCutoffDay?: number; enableMfa?: boolean }) {
    return this.prisma.companySetting.upsert({
      where: { companyId: user.companyId },
      create: { companyId: user.companyId, payrollCutoffDay: body.payrollCutoffDay ?? 25, enableMfa: body.enableMfa ?? true },
      update: { payrollCutoffDay: body.payrollCutoffDay, enableMfa: body.enableMfa },
    });
  }
}
