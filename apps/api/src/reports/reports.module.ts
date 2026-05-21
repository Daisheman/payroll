import { Module } from "@nestjs/common";
import { PayrollModule } from "../payroll/payroll.module";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({ imports: [PayrollModule], controllers: [ReportsController], providers: [ReportsService] })
export class ReportsModule {}
