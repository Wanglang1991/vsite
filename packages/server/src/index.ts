import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './config.js';
import { videoRoutes } from './routes/video.js';
import { categoryRoutes } from './routes/category.js';
import { searchRoutes } from './routes/search.js';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

await app.register(videoRoutes);
await app.register(categoryRoutes);
await app.register(searchRoutes);

app.get('/api/health', async () => ({ status: 'ok', time: Date.now() }));

try {
  await app.listen({ port: config.port, host: config.host });
  console.log('Server running at http://' + config.host + ':' + config.port);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}