import { Request, Response } from 'express-serve-static-core';
import { DataProtStatement as dps } from 'persistance/models';

export class DataProtstatementController {
  [key: string]: import('express').RequestHandler<import('express-serve-static-core').ParamsDictionary>;

  /**
   * Returns the business with passed id or nothing
   */
  public async getStatement(_req: Request, res: Response): Promise<void> {
    const statements = await dps.find();
    return res.status(200).json(statements).end();
  }
}

export const dataProtstatementController = new DataProtstatementController();
