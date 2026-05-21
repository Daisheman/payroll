export type PayType = "FIXED" | "HOURLY" | "DAILY";
export type CurrencyCode = "TZS" | "USD";

export const PAYE_BANDS = [
  { min: 0, max: 270000, rate: 0, base: 0 },
  { min: 270000, max: 520000, rate: 0.09, base: 0 },
  { min: 520000, max: 760000, rate: 0.2, base: 22500 },
  { min: 760000, max: 1000000, rate: 0.25, base: 70500 },
  { min: 1000000, max: Infinity, rate: 0.3, base: 130500 },
] as const;

export const NSSF_RATE = 0.1;
export const NSSF_CAP = 720000;
export const SDL_RATE = 0.045;
export const WCF_RATE = 0.01;
export const STANDARD_DAYS = 26;
export const STANDARD_HOURS = 9;

export type PayrollCalculationInput = {
  payType: PayType;
  currency: CurrencyCode;
  periodMonth: number;
  periodYear: number;
  startDate: string | Date;
  endDate?: string | Date | null;
  fixedSalaryTzs?: number | null;
  usdSalary?: number | null;
  exchangeRate?: number | null;
  hourlyRateTzs?: number | null;
  stdHoursPerMonth?: number | null;
  actualHoursWorked?: number | null;
  otHours?: number | null;
  phHours?: number | null;
  housingAllowance?: number | null;
  transportAllowance?: number | null;
  siteAllowance?: number | null;
  otherAdditions?: number | null;
  otherDeductions?: number | null;
  adjustments?: number | null;
};

export type PayrollCalculationResult = {
  active: boolean;
  proRataDays: number;
  daysInMonth: number;
  monthlySalaryTzs: number;
  hourlyRateTzs: number;
  actualHoursWorked: number;
  basicPay: number;
  otPay: number;
  phPay: number;
  grossPay: number;
  paye: number;
  nssfEmployee: number;
  nssfEmployer: number;
  sdl: number;
  wcf: number;
  otherDeductions: number;
  adjustments: number;
  netPay: number;
  totalEmployerCost: number;
};

const n = (value: number | null | undefined) => Number(value ?? 0);
export const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function calculatePAYE(grossTZS: number): number {
  if (grossTZS <= 0) return 0;
  for (const band of PAYE_BANDS) {
    if (grossTZS <= band.max) {
      if (band.rate === 0) return 0;
      return roundMoney(band.base + (grossTZS - band.min) * band.rate);
    }
  }
  return 0;
}

export function calculateSeverance(monthlySalary: number, completedYears: number, reason: "misconduct" | "resignation" | "contract_expiry" | "retrenchment" | "other") {
  if (["misconduct", "resignation", "contract_expiry"].includes(reason)) return 0;
  return roundMoney((monthlySalary / 30) * 7 * Math.min(Math.max(completedYears, 0), 10));
}

export function isActiveForPeriod(startDate: Date, endDate: Date | null, periodYear: number, periodMonth: number) {
  const firstDay = new Date(periodYear, periodMonth - 1, 1);
  const lastDay = new Date(periodYear, periodMonth, 0);
  return startDate <= lastDay && (!endDate || endDate >= firstDay);
}

export function calculatePayrollLine(input: PayrollCalculationInput): PayrollCalculationResult {
  const startDate = new Date(input.startDate);
  const endDate = input.endDate ? new Date(input.endDate) : null;
  const daysInMonth = new Date(input.periodYear, input.periodMonth, 0).getDate();
  const active = isActiveForPeriod(startDate, endDate, input.periodYear, input.periodMonth);
  if (!active) {
    return {
      active,
      proRataDays: 0,
      daysInMonth,
      monthlySalaryTzs: 0,
      hourlyRateTzs: 0,
      actualHoursWorked: 0,
      basicPay: 0,
      otPay: 0,
      phPay: 0,
      grossPay: 0,
      paye: 0,
      nssfEmployee: 0,
      nssfEmployer: 0,
      sdl: 0,
      wcf: 0,
      otherDeductions: 0,
      adjustments: 0,
      netPay: 0,
      totalEmployerCost: 0,
    };
  }

  const monthlySalaryTzs = input.currency === "USD" ? n(input.usdSalary) * n(input.exchangeRate) : n(input.fixedSalaryTzs);
  const isStartMonth = startDate.getFullYear() === input.periodYear && startDate.getMonth() + 1 === input.periodMonth;
  const proRataDays = isStartMonth ? daysInMonth - startDate.getDate() + 1 : daysInMonth;
  const fixedHourlyRate = monthlySalaryTzs / (STANDARD_DAYS * STANDARD_HOURS);
  const hourlyRateTzs = input.payType === "HOURLY" ? n(input.hourlyRateTzs) : fixedHourlyRate;
  const actualHoursWorked = input.payType === "HOURLY" ? n(input.actualHoursWorked) || n(input.stdHoursPerMonth) || 234 : 0;
  const basicPay =
    input.payType === "HOURLY"
      ? actualHoursWorked * hourlyRateTzs
      : monthlySalaryTzs * (proRataDays / daysInMonth);
  const otPay = n(input.otHours) * hourlyRateTzs * 1.5;
  const phPay = n(input.phHours) * hourlyRateTzs * 2;
  const otherDeductions = n(input.otherDeductions);
  const adjustments = n(input.adjustments);
  const grossPay = roundMoney(
    basicPay +
      otPay +
      phPay +
      n(input.housingAllowance) +
      n(input.transportAllowance) +
      n(input.siteAllowance) +
      n(input.otherAdditions),
  );
  const nssfEmployee = roundMoney(Math.min(grossPay * NSSF_RATE, NSSF_CAP));
  const nssfEmployer = roundMoney(Math.min(grossPay * NSSF_RATE, NSSF_CAP));
  const paye = calculatePAYE(grossPay);
  const sdl = roundMoney(grossPay * SDL_RATE);
  const wcf = roundMoney(grossPay * WCF_RATE);
  const netPay = roundMoney(grossPay - nssfEmployee - paye - otherDeductions + adjustments);
  const totalEmployerCost = roundMoney(grossPay + nssfEmployer + sdl + wcf);

  return {
    active,
    proRataDays,
    daysInMonth,
    monthlySalaryTzs: roundMoney(monthlySalaryTzs),
    hourlyRateTzs: roundMoney(hourlyRateTzs),
    actualHoursWorked: roundMoney(actualHoursWorked),
    basicPay: roundMoney(basicPay),
    otPay: roundMoney(otPay),
    phPay: roundMoney(phPay),
    grossPay,
    paye,
    nssfEmployee,
    nssfEmployer,
    sdl,
    wcf,
    otherDeductions,
    adjustments,
    netPay,
    totalEmployerCost,
  };
}
