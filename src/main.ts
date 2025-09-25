import { NestFactory } from '@nestjs/core';
// The root-level `main.ts` is used in some deployment setups. The actual
// Nest AppModule is located under `src/backend/src/app.module.ts` so import
// from that path to keep the repository-level TypeScript check happy.
import { AppModule } from './backend/src/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
