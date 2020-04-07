import mongoose from 'mongoose';
import { Jobs } from 'modules/jobs';

export function jobLoader(mongo: typeof mongoose): void {
  const jobHandler = new Jobs(mongo);
  jobHandler.start();
}
