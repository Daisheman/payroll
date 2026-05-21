import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { PayrollController } from "./payroll.controller";
import { PayrollEngineService } from "./payroll-engine.service";
import { PayrollService } from "./payroll.service";

@Module({
  imports: [AuditModule],
  controllers: [PayrollController],
  providers: [PayrollService, PayrollEngineService],
  exports: [PayrollService, PayrollEngineService],
})
export class PayrollModule {}
