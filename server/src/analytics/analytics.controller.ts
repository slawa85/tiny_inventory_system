import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('inventory-value')
  getInventoryValue() {
    return this.analyticsService.getInventoryValue();
  }

  @Get('low-stock')
  getLowStockProducts() {
    return this.analyticsService.getLowStockProducts();
  }

  @Get('category-summary')
  getCategorySummary() {
    return this.analyticsService.getCategorySummary();
  }
}
