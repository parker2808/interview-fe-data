import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly dirty = new Set<string>();
  private readonly client = createClient({
    socket: {
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
      connectTimeout: 500,
      reconnectStrategy: (attempts) => Math.min(attempts * 100, 500),
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
    if (this.dirty.has(key)) return null;
    return this.command(() => this.client.get(key));
  }

  async put(key: string, value: string): Promise<void> {
    await this.command(() => this.client.set(key, value, { EX: 30 }));
    this.dirty.delete(key);
  }

  async invalidate(key: string): Promise<void> {
    try {
      await this.command(() => this.client.del(key));
      this.dirty.delete(key);
    } catch (error) {
      this.dirty.add(key);
      throw error;
    }
  }

  async ping(): Promise<string> {
    return this.command(() => this.client.ping());
  }

  private async command<T>(run: () => Promise<T>): Promise<T> {
    if (!this.client.isReady) throw new Error('Redis cache unavailable');
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        run(),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error('Redis cache timeout')), 400);
        }),
      ]);
    } finally {
      clearTimeout(timeout);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.isOpen) await this.client.quit().catch(() => this.client.destroy());
  }
}
