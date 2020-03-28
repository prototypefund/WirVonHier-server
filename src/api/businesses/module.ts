import { Application } from 'express';
import { businessesRouter } from './router';

export function registerBusinessesModule(app: Application): void {
  app.use(businessesRouter);
}
