import { Worker } from 'bullmq';

const connection = { host: '127.0.0.1', port: 6379 };
const worker = new Worker('book-emails', async (job) => {
  const marker = `sent:${job.data.bookId}`;
  const { createClient } = await import('redis');
  const redis = createClient({ url: 'redis://127.0.0.1:6379' });
  await redis.connect();
  try {
    const first = await redis.set(marker, '1', { NX: true, EX: 3600 });
    if (!first) return 'already processed';
    console.log(`would send notification for book ${job.data.bookId}`);
    return 'processed';
  } finally {
    await redis.quit();
  }
}, { connection });

worker.on('completed', (job, result) => console.log(`job ${job.id}: ${result}`));
worker.on('failed', (job, error) => console.error(`job ${job?.id}: ${error.message}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => {
  await worker.close();
  process.exit(0);
});
