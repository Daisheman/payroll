import { IsArray, IsDateString, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";
import { IsNumber } from "class-validator";

export class CreatePayrollRunDto {
  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth!: number;

  @IsInt()
  @Min(2020)
  @Max(2100)
  periodYear!: number;

  @IsDateString()
  paymentDate!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  workingDays?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  standardHoursPerDay?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  exchangeRate?: number;

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  employeeIds?: string[];
}

export class UpdatePayrollLineDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  otHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  phHours?: number;

  @IsOptional()
  @IsNumber()
  otherDeductions?: number;

  @IsOptional()
  @IsNumber()
  adjustments?: number;

  @IsOptional()
  @IsNumber()
  otherAdditions?: number;
}
