import { Application } from 'express';
import { videoRouter } from './router';

// TODO Define return type
export function registerVideosModule(app: Application): void {
  app.use(videoRouter);
}
