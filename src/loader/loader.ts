import { Application } from 'express';
import { expressLoader } from './expressLoader';
import { mongooseLoader } from './mongooseLoader';
import { jobLoader } from './jobLoader';

class Loader {
  public async init(app: Application): Promise<void> {
    expressLoader(app);
    const db = await mongooseLoader();
    jobLoader(db);
  }
}

export const loader = new Loader();
