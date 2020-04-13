import { RequestHandler } from 'express';

export interface IDataProtStatementController {
  [key: string]: RequestHandler;
}
