import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../common/current-user";
import { ReportsService } from "./reports.service";

@ApiTags("Reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("reports")
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get("payroll-runs/:runId/summary.xlsx")
  async summary(@CurrentUser() user: { companyId: string }, @Param("runId") runId: string, @Res() res: Response) {
    const file = await this.reports.payrollSummaryExcel(user.companyId, runId);
    res.setHeader("content-type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("content-disposition", `attachment; filename="payroll-${runId}.xlsx"`);
    res.send(file);
  }

  @Get("payroll-runs/:runId/employees/:employeeId/payslip.pdf")
  async payslip(
    @CurrentUser() user: { companyId: string },
    @Param("runId") runId: string,
    @Param("employeeId") employeeId: string,
    @Res() res: Response,
  ) {
    const file = await this.reports.payslipPdf(user.companyId, runId, employeeId);
    res.setHeader("content-type", "application/pdf");
    res.setHeader("content-disposition", `attachment; filename="payslip-${employeeId}.pdf"`);
    res.send(file);
  }
}
