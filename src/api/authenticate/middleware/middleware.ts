import { Request, Response, NextFunction } from 'express';
import { authService } from 'modules/services';

export function authenticationMiddleware(req: Request, res: Response, next: NextFunction): void {
  authService.authenticateUser(req, res, next);
}
