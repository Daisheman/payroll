import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@prisma/client";
import * as argon2 from "argon2";
import { authenticator } from "otplib";
import { StringValue } from "ms";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateLogin(companySlug: string, email: string, password: string, mfaCode?: string) {
    const company = await this.prisma.company.findUnique({ where: { slug: companySlug } });
    if (!company) throw new UnauthorizedException("Invalid credentials");

    const user = await this.prisma.user.findUnique({ where: { companyId_email: { companyId: company.id, email } } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.mfaEnabled) {
      if (!mfaCode || !user.mfaSecret || !authenticator.verify({ token: mfaCode, secret: user.mfaSecret })) {
        throw new ForbiddenException("MFA verification required");
      }
    }

    return this.rotateTokens(user.id, company.id, user.email, user.roles);
  }

  async rotateTokens(userId: string, companyId: string, email: string, roles: Role[]) {
    const payload = { sub: userId, companyId, email, roles };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.config.get<StringValue>("JWT_ACCESS_TTL", "15m" as StringValue),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: this.config.get<StringValue>("JWT_REFRESH_TTL", "7d" as StringValue),
      }),
    ]);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: await argon2.hash(refreshToken), lastLoginAt: new Date() },
    });
    return { accessToken, refreshToken, user: payload };
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwt.verifyAsync<{ sub: string; companyId: string; email: string; roles: Role[] }>(refreshToken, {
      secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
    });
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash || !(await argon2.verify(user.refreshTokenHash, refreshToken))) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    return this.rotateTokens(user.id, user.companyId, user.email, user.roles);
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: null } });
  }
}
