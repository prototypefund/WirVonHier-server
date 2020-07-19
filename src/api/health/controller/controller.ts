import { IHealthController } from './controller.types';
import { RequestHandler } from 'express';

class HealthController implements IHealthController {
  public getApplicationStatus: RequestHandler = (_req, res) => {
    return res.status(200).end();
  };
}

export const healthController = new HealthController();
