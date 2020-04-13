import { Application } from 'express';
import { dataProtstatementRouter } from './router';

// TODO Define return type
export function registerDataProtStatementModule(app: Application): void {
  app.use(dataProtstatementRouter);
}
