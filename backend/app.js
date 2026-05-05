const fastify = require('fastify');
const cors = require('@fastify/cors');
const helmet = require('@fastify/helmet');
const pino = require('pino');
const { connectMongo } = require('./mongo');
const { connectRedis } = require('./redis');
const routes = require('./routes');
const { verifyFirebaseToken } = require('./auth');

async function buildApp() {
  const app = fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      ...(process.env.NODE_ENV !== 'production' && {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }),
    },
    keepAliveTimeout: 5000,
  });

  // Graceful shutdown
  const closeListeners = ['SIGINT', 'SIGTERM'];
  closeListeners.forEach(signal => {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, shutting down gracefully...`);
      await app.close();
      process.exit(0);
    });
  });

  await app.register(cors, {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  await app.register(helmet);

  // Decorate app with custom auth handler
  app.decorate('authenticate', async function (request, reply) {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid token');
      }
      const token = authHeader.split(' ')[1];
      const decodedToken = await verifyFirebaseToken(token);
      const superAdminUid = process.env.SUPER_ADMIN_UID;
      request.user = { 
        userId: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        isSuperAdmin: superAdminUid ? decodedToken.uid === superAdminUid : false
      };
    } catch (err) {
      reply.code(401).send({ error: true, message: 'Unauthorized' });
    }
  });

  // Init DB and Cache
  const db = await connectMongo();
  const redis = await connectRedis();

  app.decorate('db', db);
  app.decorate('redis', redis);

  // Load routes
  app.register(routes, { prefix: '/api' });

  return app;
}

module.exports = buildApp;
