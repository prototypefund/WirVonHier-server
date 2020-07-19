import { Router } from 'express';
import { healthController as hc } from '../controller';

export const healthRouter = Router();

healthRouter.get('/health', hc.getApplicationStatus.bind(this));
