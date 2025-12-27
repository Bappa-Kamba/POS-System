import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { getLanIp } from './common/utils';
import './mdns';

async function bootstrap() {
  const logger = new Logger('POS-Server');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      errorHttpStatusCode: 400,
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');

  const lanIp = getLanIp();

  logger.log(`Server running on: ${await app.getUrl()}`);
  if (lanIp) {
    logger.warn(`LAN fallback: http://${lanIp}:${port}`);
  }
}

bootstrap().catch((e) => console.log(`Error: ${JSON.stringify(e, null, 2)}`));
