import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return { service: '@commerce/server', status: 'ok' };
  }

  // Lightweight readiness probe — no DB call. Use /ready (added later) when
  // we want to gate on Supabase connectivity.
  @Get('health')
  health() {
    return { status: 'ok', uptime_seconds: Math.floor(process.uptime()) };
  }
}
