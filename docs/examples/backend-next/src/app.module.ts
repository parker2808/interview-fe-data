import { randomUUID } from 'node:crypto';
import {
  BadRequestException, Body, CanActivate, Controller, ExecutionContext,
  ForbiddenException, Get, Injectable, Module, Param, ParseIntPipe, Patch,
  PipeTransform, Post, Query, Req, ServiceUnavailableException,
  UnauthorizedException, UseGuards,
} from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import type { Request } from 'express';
import { BooksService, BOOK_STORE, type BookStore } from './books.service';
import { createBookSchema, localeSchema, type CreateBook } from './books.contract';
import { NotificationProcessor } from './notification.processor';
import { RedisCacheService } from './redis-cache.service';

type RequestWithId = Request & { id: string };

class BookInputPipe implements PipeTransform<unknown, CreateBook> {
  transform(value: unknown): CreateBook {
    const result = createBookSchema.safeParse(value);
    if (!result.success) throw new BadRequestException({ code: 'VALIDATION_FAILED', field: 'title' });
    return result.data;
  }
}

class LocalePipe implements PipeTransform<unknown, 'en' | 'vi'> {
  transform(value: unknown): 'en' | 'vi' {
    const result = localeSchema.safeParse(value ?? 'en');
    if (!result.success) throw new BadRequestException({ code: 'VALIDATION_FAILED', field: 'locale' });
    return result.data;
  }
}

@Injectable()
class EditorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const role: unknown = context.switchToHttp().getRequest<Request>().headers['x-test-role'];
    if (!role) throw new UnauthorizedException();
    if (role !== 'editor') throw new ForbiddenException();
    return true;
  }
}

@Controller()
class HealthController {
  constructor(private readonly cache: RedisCacheService) {}
  @Get('health/live') live() { return { status: 'alive' }; }
  @Get('health/ready') async ready() {
    try {
      await Promise.race([
        this.cache.ping(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('probe timeout')), 500)),
      ]);
      return { status: 'ready', redis: 'reachable' };
    } catch {
      throw new ServiceUnavailableException({ status: 'unready', redis: 'unavailable' });
    }
  }
}

@Controller('books')
class BooksController {
  constructor(private readonly books: BooksService) {}

  @Get() list(@Query('locale', new LocalePipe()) locale: 'en' | 'vi') {
    return this.books.list(locale);
  }

  @Post() @UseGuards(EditorGuard) create(@Body(new BookInputPipe()) data: CreateBook, @Req() request: RequestWithId) {
    return this.books.save(data, request.id);
  }

  @Patch(':id') @UseGuards(EditorGuard) update(@Param('id', ParseIntPipe) id: number, @Body(new BookInputPipe()) data: CreateBook, @Req() request: RequestWithId) {
    return this.books.save(data, request.id, id);
  }
}

const store: BookStore = {
  books: new Map([
    [1, { id: 1, title: 'Sample book', locale: 'en' }],
    [2, { id: 2, title: 'Sách mẫu', locale: 'vi' }],
  ]),
  nextId: 3,
  revision: new Map(),
};

@Module({
  imports: [BullModule.registerQueue({
    name: 'book-emails',
    connection: {
      host: process.env.REDIS_HOST ?? '127.0.0.1',
      port: Number(process.env.REDIS_PORT ?? 6379),
      connectTimeout: 500,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (attempts) => Math.min(attempts * 100, 500),
    },
  })],
  controllers: [BooksController, HealthController],
  providers: [BooksService, RedisCacheService, NotificationProcessor, EditorGuard, { provide: BOOK_STORE, useValue: store }],
})
class BooksModule {}

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        redact: { paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'], censor: '[REDACTED]' },
        genReqId(request, response) {
          const incoming = request.headers['x-request-id'];
          const remote = request.socket.remoteAddress;
          const local = remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1';
          const id = local && typeof incoming === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(incoming) ? incoming : randomUUID();
          response.setHeader('x-request-id', id);
          return id;
        },
      },
    }),
    BullModule.forRoot({ connection: {
      host: process.env.REDIS_HOST ?? '127.0.0.1', port: Number(process.env.REDIS_PORT ?? 6379),
      maxRetriesPerRequest: null,
    } }),
    BooksModule,
  ],
})
export class AppModule {}
