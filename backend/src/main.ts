import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  
  // FLAW: Improper error handling - No detailed exception filters configured.
  // FLAW: Missing basic security headers (would need helmet or similar).
  app.use(helmet());

  await app.listen(3001);
}
bootstrap();