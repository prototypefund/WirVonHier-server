import { Application } from 'express';
import { healthRouter } from './router';

export function registerHealthModule(app: Application): void {
  app.use(healthRouter);
}
