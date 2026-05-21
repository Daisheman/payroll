import { z } from "zod";
export * from "./payroll-engine";

export const companySlugSchema = z
  .string()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9-]+$/);

export const loginSchema = z.object({
  companySlug: companySlugSchema,
  email: z.string().email(),
  password: z.string().min(8),
  mfaCode: z.string().length(6).optional(),
});

export const employeeSchema = z.object({
  employeeNumber: z.string().min(2).max(40),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  employmentType: z.enum(["FIXED", "HOURLY", "DAILY"]),
  baseSalary: z.number().nonnegative(),
  hourlyRate: z.number().nonnegative().optional(),
  dailyRate: z.number().nonnegative().optional(),
  nssfNumber: z.string().max(40).optional(),
  taxIdentificationNumber: z.string().max(40).optional(),
  startDate: z.string().datetime(),
});

export const payrollRunSchema = z.object({
  periodMonth: z.number().int().min(1).max(12),
  periodYear: z.number().int().min(2020).max(2100),
  paymentDate: z.string().datetime(),
  employeeIds: z.array(z.string().uuid()).optional(),
});

export const payrollInputSchema = z.object({
  baseSalary: z.number().nonnegative(),
  employmentType: z.enum(["FIXED", "HOURLY", "DAILY"]),
  hourlyRate: z.number().nonnegative().optional(),
  dailyRate: z.number().nonnegative().optional(),
  hoursWorked: z.number().nonnegative().default(0),
  daysWorked: z.number().nonnegative().default(0),
  overtimeHours: z.number().nonnegative().default(0),
  overtimeMultiplier: z.number().positive().default(1.5),
  bonuses: z.number().nonnegative().default(0),
  gratuity: z.number().nonnegative().default(0),
  unpaidLeaveDays: z.number().nonnegative().default(0),
  leaveDeduction: z.number().nonnegative().default(0),
  severance: z.number().nonnegative().default(0),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type PayrollRunInput = z.infer<typeof payrollRunSchema>;
export type PayrollInput = z.infer<typeof payrollInputSchema>;
