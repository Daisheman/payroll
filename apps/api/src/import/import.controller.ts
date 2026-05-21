import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../common/current-user";
import { Roles } from "../common/roles.decorator";
import { RolesGuard } from "../common/roles.guard";
import { ImportService } from "./import.service";

@ApiTags("Imports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("import")
export class ImportController {
  constructor(private readonly imports: ImportService) {}

  @Post("employees")
  @Roles("OWNER", "ADMIN", "HR_MANAGER", "PAYROLL_PROCESSOR")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  async employees(@CurrentUser() user: { companyId: string }, @UploadedFile() file: any, @Body("confirm") confirm?: string, @Body("rows") rows?: string) {
    if (confirm === "true" && rows) {
      return this.imports.importEmployees(user.companyId, JSON.parse(rows));
    }
    return this.imports.previewEmployees(file.buffer);
  }

  @Post("timesheet")
  @Roles("OWNER", "ADMIN", "PAYROLL_MANAGER", "PAYROLL_PROCESSOR")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  timesheet(@UploadedFile() file: any) {
    return this.imports.previewTimesheet(file.buffer);
  }
}
