import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RbacGuard } from '../../common/guards/rbac.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('api/reports')
@UseGuards(JwtAuthGuard, RbacGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @Permissions('reports:view')
  async getDashboardMetrics() {
    return this.reportsService.getDashboardMetrics();
  }

  @Get('financials')
  @Permissions('reports:view')
  async getFinancialStats() {
    return this.reportsService.getFinancialStats();
  }
}
