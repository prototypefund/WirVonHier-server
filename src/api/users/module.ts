import { Application } from 'express';
import { userRouter } from './router';

// TODO Define return type
export function registerUserModule(app: Application): void {
  app.use(userRouter);
}
