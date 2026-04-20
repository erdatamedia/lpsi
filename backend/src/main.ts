import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allowed origins — bisa ditambah dari ENV
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL ?? '', // contoh: https://lpsi.yourdomain.com
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Opsional: prefix API
  // app.setGlobalPrefix('api');

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);

  console.log(`🚀 LPSI Backend running on port: ${port}`);
  console.log('🌐 Allowed CORS:', allowedOrigins);
}
bootstrap();
