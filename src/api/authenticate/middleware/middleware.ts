import { Request, Response, NextFunction } from 'express';

export function authenticationMiddleware(req: Request, res: Response, next: NextFunction) {
  // attach user to request
}
