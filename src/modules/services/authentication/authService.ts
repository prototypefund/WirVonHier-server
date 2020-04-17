import { NextFunction, Request, Response } from 'express-serve-static-core';
import { IAuthResponse, IAuthErrorResponse } from './authService.types';
import * as providers from './providers';
import { tokenService as ts } from 'modules/services';
import { User } from 'persistance/models';

export type AuthStrategy = 'local';
class AuthService {
  /**
   * Registers a new user with choosen strategy;
   * @param type = 'local' | 'facebook' | 'google';
   */
  registerUser(type: AuthStrategy, req: Request): Promise<IAuthResponse | IAuthErrorResponse> {
    return providers[type].register(req);
  }

  /**
   * Logs a user in with choosen strategy;
   * @param type = 'local' | 'facebook' | 'google';
   */
  loginUser(
    type: AuthStrategy,
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<IAuthResponse | IAuthErrorResponse> {
    return providers[type].login(req, res, next);
  }

  /**
   * Authenticates Request.
   * Populates req.token { id: userId, roles: userRoles[] } - if valid Authorization header was present.
   */
  authenticateUser(req: Request, _res: Response, next: NextFunction): void {
    const headers = req.headers.authentication;
    if (typeof headers === 'undefined') return next();
    const header = headers instanceof Array ? headers[0] : headers;
    const token = header.split(' ')[1];
    const payload = ts.verify(token);
    if (!payload) return next();
    req.token = payload;
    next();
  }

  async forgotPassword(req: Request): Promise<{ status: number; message?: string }> {
    return providers.local.forgotPassword(req);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async refreshToken(req: Request): Promise<IAuthResponse | IAuthErrorResponse> {
    const refreshToken = req.cookies.refresh_token;
    const payload = ts.verify(refreshToken);
    if (!payload) return { error: { status: 401, message: 'User not authenticated.' } };
    const user = await User.findById(payload.id);
    if (!user) return { error: { status: 401, message: 'User not authenticated' } };
    if (user.refreshToken !== refreshToken) return { error: { status: 401, message: 'User not authenticated.' } };
    const newRefreshToken = ts.generateRefreshToken({ id: user._id, email: user.email, roles: user.roles });
    const newToken = ts.generateToken({ id: user._id, email: user.email, roles: user.roles });
    user.refreshToken = newRefreshToken;
    user.save();
    return { token: newToken, refreshToken: newRefreshToken };
  }
}

export const authService = new AuthService();
