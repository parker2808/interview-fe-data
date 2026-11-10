import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PinoLogger } from 'nestjs-pino';

type BookJob = { bookId: number; revision: number; title: string; requestId: string };

@Processor('book-emails', {
  concurrency: 2,
  connection: {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
    maxRetriesPerRequest: null,
  },
})
export class NotificationProcessor extends WorkerHost {
  constructor(private readonly logger: PinoLogger) {
    super();
    this.logger.setContext(NotificationProcessor.name);
  }

  async process(job: Job<BookJob>): Promise<string> {
    if (job.data.title === 'FAIL_DEMO') throw new Error('forced teaching failure');
    this.logger.info({ jobId: job.id, requestId: job.data.requestId }, 'would notify for book %d revision %d', job.data.bookId, job.data.revision);
    return 'simulated';
  }

  @OnWorkerEvent('completed')
  completed(job: Job<BookJob>): void {
    this.logger.info({ jobId: job.id, requestId: job.data.requestId }, 'job completed');
  }

  @OnWorkerEvent('failed')
  failed(job: Job<BookJob> | undefined, error: Error): void {
    this.logger.warn({ jobId: job?.id, requestId: job?.data.requestId, attemptsMade: job?.attemptsMade }, 'job failed: %s', error.message);
  }
}
