import fastifyRateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';

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

fastify.get('/', function (request, reply) {
  reply.send({ hello: 'world' });
});

fastify.listen({ port: 8000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  fastify.log.info(`server listening on ${address}`);
});
