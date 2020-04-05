import { NextFunction, Request, Response } from 'express-serve-static-core';
import { IAuthResponse } from './authService.types';
import * as providers from './providers';
import { tokenService as ts } from 'modules/services';

type AuthType = 'local' | 'facebook' | 'google';

class AuthService {
  /**
   * Registers a new user with choosen strategy;
   * @param type = 'local' | 'facebook' | 'google';
   */
  registerUser(type: AuthType, req: Request, res: Response, next: NextFunction): Promise<IAuthResponse> {
    return providers[type].register(req, res, next);
  }

  /**
   * Logs a user in with choosen strategy;
   * @param type = 'local' | 'facebook' | 'google';
   */
  loginUser(type: AuthType, req: Request, res: Response, next: NextFunction): Promise<IAuthResponse> {
    return providers[type].login(req, res, next);
  }

  /**
   * Authenticates Request.
   * Populates req.token { id: userId, roles: userRoles[] } - if valid Authorization header was present.
   */
  authenticateUser(req: Request, _res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (typeof header === 'undefined') return next();

    const token = header.split(' ')[1];
    const payload = ts.verify(token);

    // TODO token does not exist on Request
    if (!payload) return next();
    //req.token = payload;
    next();
  }
}

export const authService = new AuthService();
