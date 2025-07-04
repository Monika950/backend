import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './database/data-source';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      abortOnError: false,
    });
    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    console.error('Error during App Bootstrap:', error);
    process.exit(1);
  }
}
bootstrap();
