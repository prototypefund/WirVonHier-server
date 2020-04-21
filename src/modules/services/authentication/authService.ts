import { NextFunction, Request, Response } from 'express-serve-static-core';
import { IAuthResponse, IAuthErrorResponse } from './authService.types';
import * as providers from './providers';
import {
  tokenService as ts,
  mailService,
  getEmailVerificationSubject,
  getEmailVerificationBody,
} from 'modules/services';
import { User, IUser } from 'persistance/models';

export type AuthStrategy = 'local';
class AuthService {
  /**
   * Registers a new user with choosen strategy;
   * @param type = 'local' | 'facebook' | 'google';
   */
  registerUser(type: AuthStrategy, req: Request): Promise<IAuthResponse | IAuthErrorResponse> {
    return providers[type].register.call(this, req);
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
    return providers[type].login.call(this, req, res, next);
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

  async verifyUserEmail(req: Request): Promise<{ verified: string } | IAuthErrorResponse> {
    const verficationToken = req.body.verificationToken;
    const payload = ts.verify(verficationToken);
    if (!payload) return { error: { status: 406, message: 'Verification failed. Invalid token.' } };
    const user = await User.findById(payload.id);
    if (!user) return { error: { status: 404, message: 'Verification failed. User not found.' } };
    if (user.verificationToken !== verficationToken) return { error: { status: 500, message: "Tokens don't match." } };
    user.verification.email = new Date().toUTCString();
    user.verificationToken = undefined;
    user.save();
    return { verified: user.verification.email };
  }

  async sendVerificationEmail(user: IUser): Promise<{ to: string } | IAuthErrorResponse> {
    const verificationLink = await this.getVerificationLink(user);
    mailService.send({
      to: user.email,
      from: 'info',
      subject: getEmailVerificationSubject(),
      html: getEmailVerificationBody(verificationLink),
    });
    return { to: user.email };
  }

  private async getVerificationLink(user: IUser): Promise<string> {
    const token = ts.createVerificationToken(user);
    user.verificationToken = token;
    await user.save();
    return `${APP_BASE_URL || 'http://localhost:8080'}/business/verify?token=${token}`;
  }
}

export const authService = new AuthService();
