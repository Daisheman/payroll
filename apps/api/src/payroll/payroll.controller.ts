import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { payrollInputSchema } from "@payroll/schemas";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../common/current-user";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CreatePayrollRunDto, UpdatePayrollLineDto } from "./dto";
import { PayrollEngineService, PayrollEngineInput } from "./payroll-engine.service";
import { PayrollService } from "./payroll.service";

@ApiTags("Payroll Runs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("payroll/runs")
export class PayrollController {
  constructor(private readonly payroll: PayrollService, private readonly engine: PayrollEngineService) {}

  @Get()
  list(@CurrentUser() user: { companyId: string }) {
    return this.payroll.list(user.companyId);
  }

  @Get(":id")
  get(@CurrentUser() user: { companyId: string }, @Param("id") id: string) {
    return this.payroll.get(user.companyId, id);
  }

  @Post()
  @Roles("OWNER", "ADMIN", "PAYROLL_MANAGER")
  create(@CurrentUser() user: { companyId: string; sub: string }, @Body() dto: CreatePayrollRunDto) {
    return this.payroll.create(user.companyId, user.sub, dto);
  }

  @Post(":id/approve")
  @Roles("OWNER", "ADMIN")
  approve(@CurrentUser() user: { companyId: string; sub: string }, @Param("id") id: string) {
    return this.payroll.approve(user.companyId, user.sub, id);
  }

  @Post(":id/lock")
  @Roles("OWNER")
  lock(@CurrentUser() user: { companyId: string; sub: string }, @Param("id") id: string) {
    return this.payroll.lock(user.companyId, user.sub, id);
  }

  @Patch(":runId/lines/:lineId")
  @Roles("OWNER", "ADMIN", "PAYROLL_MANAGER", "PAYROLL_PROCESSOR")
  updateLine(
    @CurrentUser() user: { companyId: string; sub: string },
    @Param("runId") runId: string,
    @Param("lineId") lineId: string,
    @Body() dto: UpdatePayrollLineDto,
  ) {
    return this.payroll.updateLine(user.companyId, user.sub, runId, lineId, dto);
  }

  @Post("calculate")
  calculate(@Body(new ZodValidationPipe(payrollInputSchema)) input: PayrollEngineInput) {
    return this.engine.calculate(input);
  }
}
