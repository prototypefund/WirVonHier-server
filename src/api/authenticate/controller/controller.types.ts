import { RequestHandler } from 'express-serve-static-core';

export interface IAuthenticationController {
  login: RequestHandler;
  register: RequestHandler;
}
