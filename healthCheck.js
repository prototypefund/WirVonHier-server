import http from 'http';
import { config } from './config';

const options = {
  host: 'localhost',
  port: config.server.port,
  timeout: 2000,
  method: 'GET',
  path: '/health',
};

const request = http.request(options, (result) => {
  console.info(`Performed health check, result ${result.statusCode}`);
  if (result.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.error(`An error occurred while performing health check, error: ${err}`);
  process.exit(1);
});

request.end();
