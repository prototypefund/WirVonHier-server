import express from 'express';
import { loader } from './loader';
import { Server } from 'http';
import { config } from 'config';

export class App {
  server: null | Server = null;

  async startApp(): Promise<void> {
    const app = express();

    await loader.init(app);
    this.server = app.listen(config.server.port, () => {
      console.log(`Server running at port: ${config.server.port}`);
      console.log(`variables`, process.env);
    });

    //
    // need this in docker container to properly exit since node doesn't handle SIGINT/SIGTERM
    // this also won't work on using npm start since:
    // https://github.com/npm/npm/issues/4603
    // https://github.com/npm/npm/pull/10868
    // https://github.com/RisingStack/kubernetes-graceful-shutdown-example/blob/master/src/index.js
    // if you want to use npm then start with `docker run --init` to help, but I still don't think it's
    // a graceful shutdown of node process
    //
    // quit on ctrl-c when running docker in terminal
    process.on('SIGINT', () => {
      console.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ', new Date().toISOString());
      this.shutdownApp();
    });

    // quit properly on docker stop
    process.on('SIGTERM', () => {
      console.info('Got SIGTERM (docker container stop). Graceful shutdown ', new Date().toISOString());
      this.shutdownApp();
    });
  }

  shutdownApp(): void {
    // close sockets?
    if (!this.server) return;
    this.server.close(function onServerClosed(err) {
      if (err) {
        console.error(err);
        process.exitCode = 1;
      }
      process.exit();
    });
  }
}
const app = new App();
app.startApp();
