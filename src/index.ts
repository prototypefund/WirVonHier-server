import 'dotenv/config';
import express from 'express';
import { loader } from './loader';
//import { dataImport } from 'modules/workers/dataImport';

const port = Number(process.env.PORT);

async function startServer(): Promise<void> {
  const app = express();

  await loader.init(app);
  //dataImport();

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running at port: ${port}`);
  });
}

startServer();
