import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  //swagger
  const config = new DocumentBuilder()
  .setTitle('Flawed Dev Blog')
  .setDescription('API documentation for the Flawed Dev Blog')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // FLAW: Improper error handling - No detailed exception filters configured.
  // FLAW: Missing basic security headers (would need helmet or similar).

  await app.listen(3001);
}
bootstrap();