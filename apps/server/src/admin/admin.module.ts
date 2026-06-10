import { Module } from '@nestjs/common';
import { AdminAuthController } from './auth/admin-auth.controller';
import { AdminAuthService } from './auth/admin-auth.service';
import { AdminAuthGuard } from './common/admin-auth.guard';

// Admin module — admin-only endpoints share the AdminAuthGuard and (when
// per-route role gating is needed) the @Roles() decorator. Domain submodules
// (products / orders / etc.) live under apps/server/src/admin/<domain>/ and
// import the guard from common/.

@Module({
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminAuthGuard],
  exports: [AdminAuthGuard, AdminAuthService],
})
export class AdminModule {}
