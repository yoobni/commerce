import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import type { AppConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // helmet's default Cross-Origin-Resource-Policy=same-origin blocks browser
  // fetches from web (4002) / admin (4003) origins even after CORS preflight
  // succeeds. CORP is a separate enforcement layer from CORS; we relax it to
  // cross-origin so credentialed XHR from approved origins can read responses.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  const config = app.get(ConfigService<AppConfig, true>);
  const port = config.get('port', { infer: true });
  const corsOrigins = config.get('corsOrigins', { infer: true });

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  });

  // Input validation is handled per-route by ZodValidationPipe (zod schemas).
  // We deliberately skip Nest's class-validator-based global ValidationPipe
  // to avoid pulling class-validator/class-transformer for two different DSLs.

  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`@commerce/server listening on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal bootstrap error', err);
  process.exit(1);
});
