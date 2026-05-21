import { Injectable } from "@nestjs/common";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { PayrollService } from "../payroll/payroll.service";

@Injectable()
export class ReportsService {
  constructor(private readonly payroll: PayrollService) {}

  async payslipPdf(companyId: string, payrollRunId: string, employeeId: string) {
    const run = await this.payroll.get(companyId, payrollRunId);
    const item = run.items.find((entry) => entry.employeeId === employeeId);
    if (!item) throw new Error("Payslip not found");
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    const done = new Promise<Buffer>((resolve) => doc.on("end", () => resolve(Buffer.concat(chunks))));
    doc.fontSize(18).text("Payslip", { align: "center" });
    doc.moveDown();
    doc.fontSize(11).text(`Employee: ${item.employee.firstName} ${item.employee.lastName}`);
    doc.text(`Employee No: ${item.employee.employeeNumber}`);
    doc.text(`Period: ${run.periodMonth}/${run.periodYear}`);
    doc.moveDown();
    [
      ["Gross Pay", item.grossPay],
      ["Taxable Pay", item.taxablePay],
      ["PAYE", item.paye],
      ["NSSF Employee", item.nssfEmployee],
      ["NSSF Employer", item.nssfEmployer],
      ["SDL", item.sdl],
      ["WCF", item.wcf],
      ["Net Pay", item.netPay],
    ].forEach(([label, value]) => doc.text(`${label}: TZS ${Number(value).toLocaleString("en-US")}`));
    doc.end();
    return done;
  }

  async payrollSummaryExcel(companyId: string, payrollRunId: string) {
    const run = await this.payroll.get(companyId, payrollRunId);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Payroll Summary");
    sheet.columns = [
      { header: "Employee No", key: "employeeNumber", width: 16 },
      { header: "Employee", key: "employee", width: 28 },
      { header: "Gross", key: "gross", width: 14 },
      { header: "PAYE", key: "paye", width: 14 },
      { header: "NSSF", key: "nssf", width: 14 },
      { header: "Net", key: "net", width: 14 },
    ];
    run.items.forEach((item) =>
      sheet.addRow({
        employeeNumber: item.employee.employeeNumber,
        employee: `${item.employee.firstName} ${item.employee.lastName}`,
        gross: Number(item.grossPay),
        paye: Number(item.paye),
        nssf: Number(item.nssfEmployee),
        net: Number(item.netPay),
      }),
    );
    sheet.getRow(1).font = { bold: true };
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
