import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../common/current-user";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("User Management")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles("OWNER", "ADMIN")
  list(@CurrentUser() user: { companyId: string }) {
    return this.prisma.user.findMany({
      where: { companyId: user.companyId },
      select: { id: true, email: true, roles: true, mfaEnabled: true, lastLoginAt: true, createdAt: true, employee: true },
      orderBy: { email: "asc" },
    });
  }

  @Patch("roles")
  @Roles("OWNER", "ADMIN")
  async updateRoles(@CurrentUser() user: { companyId: string }, @Body() body: { userId: string; roles: Role[] }) {
    await this.prisma.user.findFirstOrThrow({ where: { id: body.userId, companyId: user.companyId } });
    return this.prisma.user.update({
      where: { id: body.userId },
      data: { roles: body.roles },
      select: { id: true, email: true, roles: true },
    });
  }
}
