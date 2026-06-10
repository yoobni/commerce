import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { loadConfig } from './config/configuration';
import { SupabaseModule } from './supabase/supabase.module';
import { AppController } from './app.controller';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { ProductsModule } from './products/products.module';
import { ProductOptionsModule } from './product-options/product-options.module';
import { CommunityModule } from './community/community.module';
import { CategoriesModule } from './categories/categories.module';
import { SizesModule } from './sizes/sizes.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { CouponsModule } from './coupons/coupons.module';
import { PointsModule } from './points/points.module';
import { AccountModule } from './account/account.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';
import { AdminProductsModule } from './admin/products/admin-products.module';
import { AdminOrdersModule } from './admin/orders/admin-orders.module';
import { AdminMembersModule } from './admin/members/admin-members.module';
import { AdminCouponsModule } from './admin/coupons/admin-coupons.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
      load: [loadConfig],
    }),
    SupabaseModule,
    ProductsModule,
    ProductOptionsModule,
    CommunityModule,
    CategoriesModule,
    SizesModule,
    ReviewsModule,
    WishlistModule,
    OrdersModule,
    CartModule,
    CouponsModule,
    PointsModule,
    AccountModule,
    PaymentsModule,
    AdminModule,
    AdminProductsModule,
    AdminOrdersModule,
    AdminMembersModule,
    AdminCouponsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
  ],
})
export class AppModule {}
