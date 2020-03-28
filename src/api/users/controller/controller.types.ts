import { RequestHandler } from 'express';

export interface IUserController {
  [key: string]: RequestHandler;
}
