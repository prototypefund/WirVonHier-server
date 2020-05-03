import { Application } from 'express';
import { authenticationRouter } from './router';
import { authenticationMiddleware } from './middleware';

// TODO Define return type
export function registerAuthenticationModule(app: Application): void {
  app.use(authenticationMiddleware);
  app.use(authenticationRouter);
}
