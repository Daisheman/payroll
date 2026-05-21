import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuditService } from "../audit/audit.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePayrollRunDto, UpdatePayrollLineDto } from "./dto";
import { PayrollEngineService } from "./payroll-engine.service";

const dec = (value: number) => new Prisma.Decimal(value);

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly engine: PayrollEngineService,
    private readonly audit: AuditService,
  ) {}

  list(companyId: string) {
    return this.prisma.payrollRun.findMany({
      where: { companyId },
      include: { items: { include: { employee: true } } },
      orderBy: [{ periodYear: "desc" }, { periodMonth: "desc" }],
    });
  }

  get(companyId: string, id: string) {
    return this.prisma.payrollRun.findFirstOrThrow({
      where: { companyId, id },
      include: { items: { include: { employee: true }, orderBy: { employee: { firstName: "asc" } } } },
    });
  }

  async create(companyId: string, actorId: string, dto: CreatePayrollRunDto) {
    const employees = await this.prisma.employee.findMany({
      where: { companyId, ...(dto.employeeIds?.length ? { id: { in: dto.employeeIds } } : {}) },
    });
    if (!employees.length) throw new BadRequestException("No active employees found for this payroll run");
    if (employees.some((employee) => employee.currency === "USD") && !dto.exchangeRate) {
      throw new BadRequestException("Exchange rate is required because this company has USD employees");
    }

    const calculated = employees.map((employee) => {
      const result = this.engine.calculate({
        payType: employee.employmentType,
        currency: employee.currency,
        periodMonth: dto.periodMonth,
        periodYear: dto.periodYear,
        startDate: employee.startDate,
        endDate: employee.endDate,
        fixedSalaryTzs: Number(employee.baseSalary),
        usdSalary: employee.usdSalary ? Number(employee.usdSalary) : 0,
        exchangeRate: dto.exchangeRate,
        hourlyRateTzs: employee.hourlyRate ? Number(employee.hourlyRate) : 0,
        stdHoursPerMonth: employee.stdHoursPerMonth ? Number(employee.stdHoursPerMonth) : 234,
        actualHoursWorked: employee.stdHoursPerMonth ? Number(employee.stdHoursPerMonth) : 234,
        housingAllowance: employee.housingAllowance ? Number(employee.housingAllowance) : 0,
        transportAllowance: employee.transportAllowance ? Number(employee.transportAllowance) : 0,
        siteAllowance: employee.siteAllowance ? Number(employee.siteAllowance) : 0,
      });
      return { employee, result };
    });

    const totals = this.sumTotals(calculated.map((item) => item.result));
    const run = await this.prisma.payrollRun.create({
      data: {
        companyId,
        periodMonth: dto.periodMonth,
        periodYear: dto.periodYear,
        workingDays: dto.workingDays ?? 26,
        standardHoursPerDay: dec(dto.standardHoursPerDay ?? 9),
        exchangeRate: dto.exchangeRate ? dec(dto.exchangeRate) : undefined,
        paymentDate: new Date(dto.paymentDate),
        status: "DRAFT",
        createdById: actorId,
        totals: totals as Prisma.InputJsonValue,
        items: {
          create: calculated.map(({ employee, result }) => ({
            companyId,
            employeeId: employee.id,
            actualHours: dec(result.actualHoursWorked),
            basicPay: dec(result.basicPay),
            otPay: dec(result.otPay),
            phPay: dec(result.phPay),
            grossPay: dec(result.grossPay),
            taxablePay: dec(result.grossPay),
            paye: dec(result.paye),
            nssfEmployee: dec(result.nssfEmployee),
            nssfEmployer: dec(result.nssfEmployer),
            sdl: dec(result.sdl),
            wcf: dec(result.wcf),
            totalEmployerCost: dec(result.totalEmployerCost),
            netPay: dec(result.netPay),
            ytdGross: dec(result.grossPay),
            ytdPaye: dec(result.paye),
            details: result,
          })),
        },
      },
      include: { items: { include: { employee: true } } },
    });
    await this.audit.write(companyId, actorId, "CREATE", "PayrollRun", run.id, undefined, run);
    return run;
  }

  async updateLine(companyId: string, actorId: string, runId: string, lineId: string, dto: UpdatePayrollLineDto) {
    const line = await this.prisma.payrollItem.findFirstOrThrow({
      where: { id: lineId, companyId, payrollRunId: runId },
      include: { employee: true, payrollRun: true },
    });
    const result = this.engine.calculate({
      payType: line.employee.employmentType,
      currency: line.employee.currency,
      periodMonth: line.payrollRun.periodMonth,
      periodYear: line.payrollRun.periodYear,
      startDate: line.employee.startDate,
      endDate: line.employee.endDate,
      fixedSalaryTzs: Number(line.employee.baseSalary),
      usdSalary: line.employee.usdSalary ? Number(line.employee.usdSalary) : 0,
      exchangeRate: line.payrollRun.exchangeRate ? Number(line.payrollRun.exchangeRate) : undefined,
      hourlyRateTzs: line.employee.hourlyRate ? Number(line.employee.hourlyRate) : 0,
      stdHoursPerMonth: line.employee.stdHoursPerMonth ? Number(line.employee.stdHoursPerMonth) : 234,
      actualHoursWorked: dto.actualHours ?? Number(line.actualHours),
      otHours: dto.otHours ?? Number(line.otHours),
      phHours: dto.phHours ?? Number(line.phHours),
      otherAdditions: dto.otherAdditions ?? Number(line.otherAdditions),
      otherDeductions: dto.otherDeductions ?? Number(line.otherDeductions),
      adjustments: dto.adjustments ?? Number(line.adjustments),
      housingAllowance: line.employee.housingAllowance ? Number(line.employee.housingAllowance) : 0,
      transportAllowance: line.employee.transportAllowance ? Number(line.employee.transportAllowance) : 0,
      siteAllowance: line.employee.siteAllowance ? Number(line.employee.siteAllowance) : 0,
    });
    const updated = await this.prisma.payrollItem.update({
      where: { id: lineId },
      data: {
        actualHours: dec(dto.actualHours ?? Number(line.actualHours)),
        otHours: dec(dto.otHours ?? Number(line.otHours)),
        phHours: dec(dto.phHours ?? Number(line.phHours)),
        otherAdditions: dec(dto.otherAdditions ?? Number(line.otherAdditions)),
        otherDeductions: dec(dto.otherDeductions ?? Number(line.otherDeductions)),
        adjustments: dec(dto.adjustments ?? Number(line.adjustments)),
        basicPay: dec(result.basicPay),
        otPay: dec(result.otPay),
        phPay: dec(result.phPay),
        grossPay: dec(result.grossPay),
        taxablePay: dec(result.grossPay),
        paye: dec(result.paye),
        nssfEmployee: dec(result.nssfEmployee),
        nssfEmployer: dec(result.nssfEmployer),
        sdl: dec(result.sdl),
        wcf: dec(result.wcf),
        totalEmployerCost: dec(result.totalEmployerCost),
        netPay: dec(result.netPay),
        details: result,
      },
      include: { employee: true },
    });
    await this.recalculateTotals(companyId, runId);
    await this.audit.write(companyId, actorId, "UPDATE", "PayrollItem", lineId, line, updated);
    return updated;
  }

  async approve(companyId: string, actorId: string, id: string) {
    const before = await this.prisma.payrollRun.findFirstOrThrow({ where: { companyId, id } });
    const run = await this.prisma.payrollRun.update({
      where: { id },
      data: { status: "APPROVED", approvedBy: actorId, approvedAt: new Date() },
      include: { items: { include: { employee: true } } },
    });
    await this.audit.write(companyId, actorId, "APPROVE", "PayrollRun", id, before, run);
    return run;
  }

  async lock(companyId: string, actorId: string, id: string) {
    const run = await this.get(companyId, id);
    const locked = await this.prisma.$transaction(async (tx) => {
      const updatedRun = await tx.payrollRun.update({
        where: { id },
        data: { status: "LOCKED", lockedBy: actorId, lockedAt: new Date() },
        include: { items: { include: { employee: true } } },
      });
      for (const item of updatedRun.items) {
        await tx.payrollLineSnapshot.upsert({
          where: { payrollLineId: item.id },
          update: { snapshotData: item as unknown as Prisma.InputJsonValue, lockedAt: new Date(), lockedBy: actorId },
          create: { payrollLineId: item.id, companyId, snapshotData: item as unknown as Prisma.InputJsonValue, lockedAt: new Date(), lockedBy: actorId },
        });
      }
      return updatedRun;
    });
    await this.audit.write(companyId, actorId, "LOCK", "PayrollRun", id, run, locked);
    return locked;
  }

  private async recalculateTotals(companyId: string, runId: string) {
    const items = await this.prisma.payrollItem.findMany({ where: { companyId, payrollRunId: runId } });
    await this.prisma.payrollRun.update({ where: { id: runId }, data: { totals: this.sumTotals(items) as Prisma.InputJsonValue } });
  }

  private sumTotals(items: Array<{ grossPay: unknown; paye: unknown; nssfEmployee: unknown; nssfEmployer: unknown; sdl: unknown; wcf: unknown; netPay: unknown; totalEmployerCost?: unknown }>): Record<string, number> {
    const initial: Record<string, number> = { grossPay: 0, paye: 0, nssfEmployee: 0, nssfEmployer: 0, sdl: 0, wcf: 0, netPay: 0, totalEmployerCost: 0 };
    return items.reduce<Record<string, number>>(
      (acc, item) => ({
        grossPay: acc.grossPay + Number(item.grossPay),
        paye: acc.paye + Number(item.paye),
        nssfEmployee: acc.nssfEmployee + Number(item.nssfEmployee),
        nssfEmployer: acc.nssfEmployer + Number(item.nssfEmployer),
        sdl: acc.sdl + Number(item.sdl),
        wcf: acc.wcf + Number(item.wcf),
        netPay: acc.netPay + Number(item.netPay),
        totalEmployerCost: acc.totalEmployerCost + Number(item.totalEmployerCost ?? 0),
      }),
      initial,
    );
  }
}
