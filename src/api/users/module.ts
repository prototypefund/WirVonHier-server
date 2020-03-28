import { Application } from 'express';
import { userRouter } from './router';

export function registerUserModule(app: Application) {
  app.use(userRouter);
}
