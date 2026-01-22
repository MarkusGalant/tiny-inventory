import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { trace } from '@opentelemetry/api';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import { AppModule } from './app.module';
import { initializeTelemetry } from './common/telemetry/telemetry.config';

initializeTelemetry();

const addTrace = winston.format((info) => {
  const span = trace.getActiveSpan();
  if (span) info.traceId = span.spanContext().traceId;
  return info;
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            addTrace(),
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            process.env.NODE_ENV === 'production' ? winston.format.json() : winston.format.simple(),
          ),
        }),
      ],
      level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'error' : 'debug'),
    }),
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Tiny Inventory API')
    .setDescription('REST API for Tiny Inventory Management System')
    .setVersion('1.0')
    .addTag('stores', 'Store management operations')
    .addTag('products', 'Product management operations')
    .addTag('statistics', 'Inventory statistics and analytics')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/docs`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
