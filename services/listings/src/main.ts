import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const port = process.env.LISTINGS_SERVICE_PORT;
    const app = await NestFactory.create(AppModule);
    // Set global prefix to handle requests routed from /api/listings
    app.setGlobalPrefix('api/listings');
    await app.listen(port || 3005);
}
bootstrap();
