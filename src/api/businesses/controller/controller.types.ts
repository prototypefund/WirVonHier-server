import { RequestHandler } from 'express';

export interface IBusinessesController {
  [key: string]: RequestHandler;
}
