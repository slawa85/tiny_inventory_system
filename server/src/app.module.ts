import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { StoresModule } from './stores/stores.module';
import { ProductsModule } from './products/products.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    PrismaModule,
    StoresModule,
    ProductsModule,
    AnalyticsModule,
    HealthModule,
  ],
})
export class AppModule {}
