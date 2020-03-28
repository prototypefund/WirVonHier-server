import { Application } from 'express';
import { expressLoader } from './expressLoader';
import { mongooseLoader } from './mongooseLoader';

class Loader {
  public async init(app: Application): Promise<void> {
    expressLoader(app);
    await mongooseLoader();
  }
}

export const loader = new Loader();
