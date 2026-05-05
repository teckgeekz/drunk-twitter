const cluster = require('cluster');
const os = require('os');
const buildApp = require('./app');

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork(); // Replace the dead worker
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  const start = async () => {
    const app = await buildApp();
    try {
      await app.listen({ port: process.env.PORT || 8080, host: '0.0.0.0' });
      console.log(`Worker ${process.pid} started`);
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  };

  start();
}
