import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Security headers
  app.use(helmet());

  // CORS: allow from env or localhost defaults
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ];
  const envOrigins = (process.env.CORS_ORIGINS || process.env.NEXTAUTH_URL || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: envOrigins.length ? envOrigins : defaultOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global prefix for APIs
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Rate limiting (basic)
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 200,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
