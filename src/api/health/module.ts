import { Application } from 'express';
import { healthRouter } from './router';

// TODO Define return type
export function registerHealthModule(app: Application): void {
  app.use(healthRouter);
}
