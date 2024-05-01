import fastifyRateLimit from '@fastify/rate-limit';
import fastifyWebsocket from '@fastify/websocket';
import Fastify from 'fastify';
import { handleWebsocketConnection } from './src/handlers.js';

const LOGGER_CONFIG =
  process.env.NODE_ENV !== 'production'
    ? { transport: { target: '@fastify/one-line-logger' } }
    : true;

const fastify = Fastify({
  logger: LOGGER_CONFIG,
});

fastify.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

fastify.get('/', (_, reply) => {
  reply.send({ hello: 'world' });
});

fastify.register(fastifyWebsocket);

fastify.register(async function (fastify) {
  fastify.get('/ws', { websocket: true }, handleWebsocketConnection);
});

fastify.listen({ port: 8000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  fastify.log.info(`server listening on ${address}`);
});
