import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const port = process.env.USER_SERVICE_PORT || 3005;
    const app = await NestFactory.create(AppModule);
    
    // ========== ENABLE CORS ==========
    app.enableCors({
        origin: [
            'https://localhost',
            'https://localhost:443',
            'http://localhost',
            'http://localhost:3003',
            process.env.FRONTEND_URL,
        ].filter(Boolean),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    // Enable validation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    
    // Set global prefix
    app.setGlobalPrefix('api/users');
    
    await app.listen(port);
    console.log(`User Management Service running on port ${port}`);
}
bootstrap();
