import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly client = createClient({
    socket: {
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
      connectTimeout: 500,
      reconnectStrategy: false,
    },
    disableOfflineQueue: true,
  });

  constructor() {
    this.client.on('error', () => {});
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async put(key: string, value: string): Promise<void> {
    await this.client.set(key, value, { EX: 30 });
  }

  async invalidate(key: string): Promise<void> {
    await this.client.del(key);
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) await this.client.quit().catch(() => this.client.destroy());
  }
}
