import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const corsOrigins =
    process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8081',
      'http://localhost:8082',
      'http://192.168.1.3:3000',
      'http://192.168.1.3:3001',
      'http://192.168.1.37:3000',
      'http://192.168.1.37:8081',
      'http://192.168.1.37:8082',
      'exp://localhost:8081',
      '*'
    ];

  app.enableCors({
    origin: '*', // Allow ALL origins
    credentials: false, // Disable cookies/credentials for wildcard origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.use(helmet());

  app.useStaticAssets(join(process.cwd(), process.env.UPLOADS_PATH || 'uploads'), {
    prefix: '/uploads/',
  });

  // Global validation pipe & filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Delivery Ocotepeque API')
    .setDescription('Food delivery API for Ocotepeque, Honduras')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API running on http://localhost:${port}`);
  console.log(`🌐 Network: http://192.168.1.3:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
}

bootstrap();
