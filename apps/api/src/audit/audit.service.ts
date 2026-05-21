import { Injectable } from "@nestjs/common";
import { AuditAction, Prisma } from "@prisma/client";
import { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async write(
    companyId: string,
    actorId: string | null,
    action: keyof typeof AuditAction,
    entity: string,
    entityId?: string,
    before?: unknown,
    after?: unknown,
    request?: Request,
  ) {
    return this.prisma.auditLog.create({
      data: {
        companyId,
        actorId,
        action,
        entity,
        entityId,
        before: before === undefined ? undefined : (before as Prisma.InputJsonValue),
        after: after === undefined ? undefined : (after as Prisma.InputJsonValue),
        ipAddress: request?.ip,
        userAgent: Array.isArray(request?.headers["user-agent"]) ? request?.headers["user-agent"][0] : request?.headers["user-agent"],
      },
    });
  }
}
