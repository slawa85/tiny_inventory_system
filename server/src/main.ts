import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger as PinoLogger } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

function getCorsConfig(config: ConfigService, logger: Logger) {
  const allowedOriginsEnv = config.get<string>('CORS_ALLOWED_ORIGINS');
  const nodeEnv = config.get<string>('NODE_ENV');

  // In development without explicit origins, use defaults
  if (!allowedOriginsEnv) {
    return {
      origin: ['http://localhost:8080', 'http://localhost:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    };
  }

  const allowedOrigins = allowedOriginsEnv
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  logger.log(`CORS configured for origins: ${allowedOrigins.join(', ')}`);

  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (same-origin, Postman, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino logger for all NestJS logging
  app.useLogger(app.get(PinoLogger));

  const logger = new Logger('Bootstrap');
  const config = app.get(ConfigService);

  // Security headers
  app.use(helmet());

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ZodValidationPipe());

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors(getCorsConfig(config, logger));

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api`);
}

bootstrap();
