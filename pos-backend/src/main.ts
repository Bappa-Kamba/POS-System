import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix, { exclude: [''] });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      errorHttpStatusCode: 400,
    }),
  );

  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  app.enableCors({
    origin: corsOrigin
      ? corsOrigin.split(',').map((value) => value.trim())
      : true,
    credentials: true,
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
}

bootstrap().catch((e) => console.log(`Error: ${JSON.stringify(e, null, 2)}`));
