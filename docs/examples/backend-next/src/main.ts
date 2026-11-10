import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { RedisCacheService } from './redis-cache.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  try { await app.get(RedisCacheService).connect(); }
  catch { console.warn('Redis cache unavailable on startup; reads will use store'); }
  app.setGlobalPrefix('api');
  const shutdown = () => {
    const deadline = setTimeout(() => process.exit(1), 2000);
    deadline.unref();
    void app.close().then(() => {
      clearTimeout(deadline);
      process.exit(0);
    });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
  console.log('Nest books listening on 3000');
}
void bootstrap();
