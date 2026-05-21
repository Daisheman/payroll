import { Injectable } from "@nestjs/common";
import { ContractType, Currency, EmploymentType } from "@prisma/client";
import ExcelJS from "exceljs";
import { PrismaService } from "../prisma/prisma.service";

type ImportRow = {
  row: number;
  employeeNumber: string;
  fullName: string;
  employmentType: EmploymentType;
  title?: string;
  contractType: ContractType;
  baseSalary: number;
  hourlyRate?: number;
  stdHoursPerMonth?: number;
  housingAllowance?: number;
  transportAllowance?: number;
  siteAllowance?: number;
  startDate: string;
  nationality?: string;
  currency: Currency;
  usdSalary?: number;
  errors: string[];
};

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  async previewEmployees(buffer: Buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as any);
    const sheet = workbook.worksheets[0];
    const rows: ImportRow[] = [];
    for (let rowNo = 8; rowNo <= sheet.rowCount; rowNo += 1) {
      const row = sheet.getRow(rowNo);
      const fullName = String(row.getCell(2).value ?? "").trim();
      if (!fullName) break;
      const employmentType = String(row.getCell(4).value ?? "").trim().toUpperCase() as EmploymentType;
      const currency = String(row.getCell(16).value ?? "TZS").trim().toUpperCase() as Currency;
      const imported: ImportRow = {
        row: rowNo,
        fullName,
        employeeNumber: String(row.getCell(3).value ?? "").trim(),
        employmentType,
        title: String(row.getCell(5).value ?? "").trim(),
        contractType: String(row.getCell(6).value ?? "Citizen").trim() as ContractType,
        baseSalary: Number(row.getCell(7).value ?? 0),
        hourlyRate: Number(row.getCell(8).value ?? 0) || undefined,
        stdHoursPerMonth: Number(row.getCell(9).value ?? 0) || undefined,
        housingAllowance: Number(row.getCell(10).value ?? 0) || undefined,
        transportAllowance: Number(row.getCell(11).value ?? 0) || undefined,
        siteAllowance: Number(row.getCell(12).value ?? 0) || undefined,
        startDate: this.excelDate(row.getCell(13).value),
        nationality: String(row.getCell(14).value ?? "").trim(),
        currency,
        usdSalary: Number(row.getCell(17).value ?? 0) || undefined,
        errors: [],
      };
      if (!imported.employeeNumber) imported.errors.push("Employee code is required");
      if (!["FIXED", "HOURLY", "DAILY"].includes(imported.employmentType)) imported.errors.push("Pay Type must be FIXED or HOURLY");
      if (!["TZS", "USD"].includes(imported.currency)) imported.errors.push("Currency must be TZS or USD");
      rows.push(imported);
    }
    return rows;
  }

  async importEmployees(companyId: string, rows: ImportRow[]) {
    const saved = [];
    for (const row of rows.filter((entry) => entry.errors.length === 0)) {
      const [firstName, ...rest] = row.fullName.split(" ");
      saved.push(
        await this.prisma.employee.upsert({
          where: { id: await this.findEmployeeId(companyId, row.employeeNumber) },
          create: {
            companyId,
            employeeNumber: row.employeeNumber,
            fullName: row.fullName,
            firstName,
            lastName: rest.join(" ") || firstName,
            title: row.title,
            contractType: row.contractType,
            employmentType: row.employmentType,
            baseSalary: row.baseSalary,
            hourlyRate: row.hourlyRate,
            stdHoursPerMonth: row.stdHoursPerMonth,
            housingAllowance: row.housingAllowance,
            transportAllowance: row.transportAllowance,
            siteAllowance: row.siteAllowance,
            startDate: new Date(row.startDate),
            nationality: row.nationality,
            currency: row.currency,
            usdSalary: row.usdSalary,
          },
          update: {
            fullName: row.fullName,
            firstName,
            lastName: rest.join(" ") || firstName,
            title: row.title,
            contractType: row.contractType,
            employmentType: row.employmentType,
            baseSalary: row.baseSalary,
            hourlyRate: row.hourlyRate,
            stdHoursPerMonth: row.stdHoursPerMonth,
            housingAllowance: row.housingAllowance,
            transportAllowance: row.transportAllowance,
            siteAllowance: row.siteAllowance,
            startDate: new Date(row.startDate),
            nationality: row.nationality,
            currency: row.currency,
            usdSalary: row.usdSalary,
          },
        }),
      );
    }
    return saved;
  }

  async previewTimesheet(buffer: Buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as any);
    return workbook.worksheets.map((sheet) => ({
      sheet: sheet.name,
      employeeNumber: String(sheet.getRow(4).getCell(3).value ?? "").trim(),
      actualHours: Number(sheet.getRow(49).getCell(3).value ?? 0),
      phHours: Number(sheet.getRow(49).getCell(8).value ?? 0),
      otHours: Number(sheet.getRow(49).getCell(9).value ?? 0),
    }));
  }

  private async findEmployeeId(companyId: string, employeeNumber: string) {
    const existing = await this.prisma.employee.findFirst({ where: { companyId, employeeNumber } });
    return existing?.id ?? "__new__";
  }

  private excelDate(value: unknown) {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === "number") return new Date(Math.round((value - 25569) * 86400 * 1000)).toISOString();
    return new Date(String(value)).toISOString();
  }
}
