import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';
import type { CreateBook, PublicBook } from './books.contract';
import { RedisCacheService } from './redis-cache.service';

export const BOOK_STORE = Symbol('BOOK_STORE');
export type BookStore = { books: Map<number, PublicBook>; nextId: number; revision: Map<number, number> };

@Injectable()
export class BooksService {
  private readonly inFlight = new Map<string, Promise<PublicBook[]>>();

  constructor(
    @Inject(BOOK_STORE) private readonly store: BookStore,
    private readonly cache: RedisCacheService,
    @InjectQueue('book-emails') private readonly queue: Queue,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(BooksService.name);
  }

  async list(locale: 'en' | 'vi'): Promise<{ source: 'cache' | 'store'; books: PublicBook[] }> {
    const key = `books:list:v1:locale:${locale}`;
    try {
      const value = await this.cache.get(key);
      if (value) return { source: 'cache', books: JSON.parse(value) as PublicBook[] };
    } catch {
      this.logger.warn({ key }, 'cache unavailable; reading store');
    }
    let flight = this.inFlight.get(key);
    if (!flight) {
      flight = (async () => {
        const books = [...this.store.books.values()].filter((book) => book.locale === locale);
        try { await this.cache.put(key, JSON.stringify(books)); }
        catch { this.logger.warn({ key }, 'cache fill skipped'); }
        return books;
      })().finally(() => this.inFlight.delete(key));
      this.inFlight.set(key, flight);
    }
    return { source: 'store', books: await flight };
  }

  async save(data: CreateBook, requestId: string, id?: number): Promise<PublicBook> {
    const bookId = id ?? this.store.nextId++;
    const previous = this.store.books.get(bookId);
    if (id && !previous) throw new Error('book not found in teaching store');
    const book: PublicBook = { id: bookId, ...data };
    this.store.books.set(bookId, book);
    const revision = (this.store.revision.get(bookId) ?? 0) + 1;
    this.store.revision.set(bookId, revision);
    try { await this.cache.invalidate(`books:list:v1:locale:${data.locale}`); }
    catch { this.logger.warn('cache invalidation unavailable; check stale values after recovery'); }
    if (previous && previous.locale !== data.locale) {
      try { await this.cache.invalidate(`books:list:v1:locale:${previous.locale}`); }
      catch { this.logger.warn('old-locale invalidation unavailable'); }
    }
    try {
      await this.cache.ping();
      let deadline: ReturnType<typeof setTimeout> | undefined;
      const enqueue = this.queue.add('notify', { bookId, revision, title: book.title, requestId }, {
        jobId: `notify-${bookId}-${revision}`,
        attempts: 2,
        backoff: { type: 'fixed', delay: 250 },
        removeOnComplete: false,
        removeOnFail: false,
      });
      try {
        await Promise.race([
          enqueue,
          new Promise<never>((_, reject) => {
            deadline = setTimeout(() => reject(new Error('enqueue timeout')), 900);
          }),
        ]);
      } finally {
        clearTimeout(deadline);
      }
    } catch {
      throw new ServiceUnavailableException('book stored but enqueue failed; reconcile before retry');
    }
    return book;
  }
}
