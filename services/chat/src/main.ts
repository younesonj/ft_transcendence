import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

    app.enableCors({
        origin: [
            process.env.APP_URL,
        ].filter(Boolean),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,  // ← IMPORTANT: Allow cookies
    });

  await app.listen(process.env.CHAT_SERVICE_PORT || 3001);
}
bootstrap();