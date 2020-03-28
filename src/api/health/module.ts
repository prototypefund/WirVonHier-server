import { Application } from 'express';
import { healthRouter } from './router';

export function registerHealthModule(app: Application) {
  app.use(healthRouter);
}
