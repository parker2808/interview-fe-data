import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { createClient } from 'redis';
import { Queue } from 'bullmq';
import pino from 'pino';

const redis = createClient({ url: 'redis://127.0.0.1:6379' });
redis.on('error', () => {});
await redis.connect();
const queue = new Queue('book-emails', { connection: { host: '127.0.0.1', port: 6379 } });
const logger = pino({ level: 'info' });
const books = new Map([['1', { id: '1', title: 'Clean Code' }]]);
const flights = new Map();
const port = Number(process.env.PORT || 4319);

async function getBook(id) {
  const key = `book:${id}`;
  const cached = await redis.get(key);
  if (cached) return { source: 'cache', book: JSON.parse(cached) };
  let flight = flights.get(key);
  if (!flight) {
    flight = (async () => {
      const book = books.get(id);
      if (book) await redis.set(key, JSON.stringify(book), { EX: 30 });
      return { source: 'store', book };
    })().finally(() => flights.delete(key));
    flights.set(key, flight);
  }
  return flight;
}

const server = createServer(async (request, response) => {
  const requestId = randomUUID();
  response.setHeader('x-request-id', requestId);
  response.setHeader('content-type', 'application/json');
  const started = Date.now();
  try {
    if (request.method === 'GET' && request.url === '/health') {
      await redis.ping();
      response.end(JSON.stringify({ status: 'ok', redis: 'reachable' }));
    } else if (request.method === 'GET' && request.url?.startsWith('/books/')) {
      const result = await getBook(request.url.slice(7));
      response.statusCode = result.book ? 200 : 404;
      response.end(JSON.stringify(result));
    } else if (request.method === 'POST' && request.url === '/books') {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      const data = JSON.parse(Buffer.concat(chunks).toString());
      if (typeof data.id !== 'string' || typeof data.title !== 'string') {
        response.statusCode = 400;
        response.end(JSON.stringify({ error: 'id and title required' }));
      } else {
        books.set(data.id, { id: data.id, title: data.title });
        await redis.del(`book:${data.id}`);
        await queue.add('notify', { bookId: data.id }, {
          jobId: `notify-${data.id}`, attempts: 3,
          backoff: { type: 'exponential', delay: 1000 }, removeOnComplete: false,
        });
        response.statusCode = 201;
        response.end(JSON.stringify({ id: data.id, queued: true }));
      }
    } else {
      response.statusCode = 404;
      response.end(JSON.stringify({ error: 'not found' }));
    }
  } catch (error) {
    response.statusCode = 500;
    response.end(JSON.stringify({ error: 'internal', requestId }));
    logger.error({ requestId, err: error }, 'request failed');
  } finally {
    logger.info({ requestId, method: request.method, status: response.statusCode, durationMs: Date.now() - started }, 'request complete');
  }
});

server.listen(port, () => console.log(`books listening on ${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => {
  server.close();
  await queue.close();
  await redis.quit();
  process.exit(0);
});
