import dotenv from 'dotenv';
9;
import express from 'express';
import { loader } from './loader';
dotenv.config();

const port = Number(process.env.PORT);

async function startServer() {
  const app = express();

  await loader.init(app);

  app.listen(port, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`Server running at port: ${port}`);
  });
}

startServer();
