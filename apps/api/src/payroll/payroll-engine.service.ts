import { Injectable } from "@nestjs/common";
import { EmploymentType } from "@prisma/client";
import { calculatePAYE, calculatePayrollLine, calculateSeverance, PayrollCalculationInput } from "@payroll/schemas";

export type PayrollEngineInput = PayrollCalculationInput & {
  employmentType?: EmploymentType;
  baseSalary?: number;
  hourlyRate?: number;
  overtimeHours?: number;
};

@Injectable()
export class PayrollEngineService {
  calculate(input: PayrollEngineInput) {
    return calculatePayrollLine({
      ...input,
      payType: input.payType ?? input.employmentType ?? "FIXED",
      fixedSalaryTzs: input.fixedSalaryTzs ?? input.baseSalary ?? 0,
      hourlyRateTzs: input.hourlyRateTzs ?? input.hourlyRate ?? 0,
      otHours: input.otHours ?? input.overtimeHours ?? 0,
    });
  }

  calculatePAYE(grossTzs: number) {
    return calculatePAYE(grossTzs);
  }

  calculateSeverance(monthlySalary: number, completedYears: number, reason: "misconduct" | "resignation" | "contract_expiry" | "retrenchment" | "other") {
    return calculateSeverance(monthlySalary, completedYears, reason);
  }
}
