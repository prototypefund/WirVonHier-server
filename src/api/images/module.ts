import { Application } from 'express';
import { imageRouter } from './router';

// TODO Define return type
export function registerImagesModule(app: Application): void {
  app.use(imageRouter);
}
