import { Application } from 'express';
import { authenticationRouter } from './router';
import { authenticationMiddleware } from './middleware';

export function registerAuthenticationModule(app: Application) {
  app.use(authenticationRouter);
  app.use(authenticationMiddleware);
}
