import { Queue } from 'bullmq';

async function main(): Promise<void> {
  const queue = new Queue('book-emails', {
    connection: { host: process.env.REDIS_HOST ?? '127.0.0.1', port: Number(process.env.REDIS_PORT ?? 6379) },
  });
  try {
    for (const id of process.argv.slice(2)) {
      const job = await queue.getJob(id);
      console.log(`${id}: ${job ? await job.getState() : 'missing'}, attemptsMade=${job?.attemptsMade ?? 0}, reason=${job?.failedReason || 'none'}`);
    }
    console.log(`counts=${JSON.stringify(await queue.getJobCounts('completed', 'failed', 'waiting', 'delayed'))}`);
  } finally {
    await queue.close();
  }
}
void main();
