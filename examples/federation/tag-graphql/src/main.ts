import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      forbidUnknownValues: true,
    }),
  );

  await app.listen(3003);
}

bootstrap().then(
  () => process.exit(),
  (err: Error) => {
    // eslint-disable-next-line no-console
    console.error(err.stack);
    process.exit(1);
  },
);
