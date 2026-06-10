import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminStatsService } from './admin-stats.service';
import { AdminAuthGuard } from '../common/admin-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RecentOrdersQuerySchema } from './admin-stats.schemas';

//   GET /admin/stats/dashboard              today/yesterday counts/revenue
//   GET /admin/stats/weekly-sales           last 7 days revenue/orders by day
//   GET /admin/stats/recent-orders?limit=5
//   GET /admin/stats/order-status-counts    histogram

@Controller('admin/stats')
@UseGuards(AdminAuthGuard)
export class AdminStatsController {
  constructor(private readonly stats: AdminStatsService) {}

  @Get('dashboard')
  dashboard() {
    return this.stats.dashboard();
  }

  @Get('weekly-sales')
  weeklySales() {
    return this.stats.weeklySales();
  }

  @Get('recent-orders')
  recentOrders(
    @Query(new ZodValidationPipe(RecentOrdersQuerySchema))
    query: typeof RecentOrdersQuerySchema._output
  ) {
    return this.stats.recentOrders(query.limit);
  }

  @Get('order-status-counts')
  orderStatusCounts() {
    return this.stats.orderStatusCounts();
  }
}
