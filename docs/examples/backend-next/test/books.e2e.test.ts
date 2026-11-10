import 'reflect-metadata';
import { afterAll, beforeAll, expect, it } from 'vitest';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { RedisCacheService } from '../src/redis-cache.service';

let app: INestApplication;
beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  await app.get(RedisCacheService).connect();
  await app.get(RedisCacheService).invalidate('books:list:v1:locale:en');
  app.setGlobalPrefix('api');
  await app.init();
});
afterAll(async () => { await app?.close(); });

it('uses cache-aside and preserves Zod before write', async () => {
  const first = await request(app.getHttpServer()).get('/api/books?locale=en').expect(200);
  expect(first.body).toMatchObject({ source: 'store' });
  const second = await request(app.getHttpServer()).get('/api/books?locale=en').expect(200);
  expect(second.body).toMatchObject({ source: 'cache' });
  await request(app.getHttpServer()).post('/api/books').send({ title: '', locale: 'en' }).expect(401);
  await request(app.getHttpServer()).post('/api/books').set('x-test-role', 'reader').send({ title: 'DDD', locale: 'en' }).expect(403);
  await request(app.getHttpServer()).post('/api/books').set('x-test-role', 'editor').send({ title: '', locale: 'en' }).expect(400);
  await request(app.getHttpServer()).post('/api/books').set('x-test-role', 'editor').send({ title: 'DDD', locale: 'en' }).expect(201);
  const afterWrite = await request(app.getHttpServer()).get('/api/books?locale=en').expect(200);
  expect(afterWrite.body).toMatchObject({ source: 'store' });
});

it('tracks a request id and reports readiness', async () => {
  const response = await request(app.getHttpServer()).get('/api/health/ready').set('x-request-id', 'local-check').expect(200);
  expect(response.headers['x-request-id']).toBe('local-check');
  expect(response.body).toEqual({ status: 'ready', redis: 'reachable' });
  await request(app.getHttpServer()).get('/api/health/live').expect(200, { status: 'alive' });
});
