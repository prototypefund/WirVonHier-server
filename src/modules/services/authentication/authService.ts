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

  async requestNewPassword(req: Request): Promise<{ status: number; message?: string }> {
    return providers.local.requestNewPassword(req);
  }
  async resetPassword(req: Request): Promise<{ status: number; message?: string }> {
    return providers.local.resetPassword(req);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async refreshToken(req: Request): Promise<IAuthResponse | IAuthErrorResponse> {
    const refreshToken = req.cookies.refresh_token;
    const publicRefreshToken = req.cookies.public_refresh_token;
    const payloadPriv = ts.verify(refreshToken);
    const payloadPub = ts.verify(publicRefreshToken);
    if (!payloadPriv || !payloadPub || payloadPub.id !== payloadPriv.id)
      return { error: { status: 401, message: 'User not authenticated.' } };
    const user = await User.findById(payloadPub.id);
    if (!user) return { error: { status: 401, message: 'User not authenticated' } };
    const newRefreshToken = ts.generateRefreshToken({ id: user._id, email: user.email });
    const newPublicRefreshToken = ts.generateRefreshToken({ id: user._id });
    const newToken = ts.generateToken({ id: user._id, email: user.email, roles: user.roles });
    return { token: newToken, refreshToken: newRefreshToken, publicRefreshToken: newPublicRefreshToken };
  }

  async verifyUserEmail(req: Request): Promise<{ verified: string } | IAuthErrorResponse> {
    const verficationToken = req.body.verificationToken;
    const payload = ts.verify(verficationToken);
    if (!payload) return { error: { status: 406, message: 'Verification failed. Invalid token.' } };
    const user = await User.findById(payload.id);
    if (!user) return { error: { status: 404, message: 'Verification failed. User not found.' } };
    if (user.verification.email) return { verified: user.verification.email };
    if (user.verificationToken !== verficationToken) return { error: { status: 500, message: "Tokens don't match." } };
    user.verification.email = new Date().toUTCString();
    user.verificationToken = undefined;
    user.save();
    return { verified: user.verification.email };
  }

  async sendVerificationEmail(user: IUser): Promise<{ to: string } | IAuthErrorResponse> {
    try {
      const verificationLink = await this.createVerificationLink(user);
      await mailService.send({
        to: user.email,
        from: 'info',
        subject: getEmailVerificationSubject(),
        html: getEmailVerificationBody(verificationLink),
      });
      return { to: user.email };
    } catch (e) {
      return { error: { status: 400, message: e.message } };
    }
  }

  async authenticateMe(req: Request): Promise<string | void> {
    const refreshToken = req.cookies.refresh_token;
    const publicRefreshToken = req.cookies.public_refresh_token;
    if (!refreshToken || !publicRefreshToken) return;
    const payloadPriv = ts.verify(refreshToken);
    const payloadPub = ts.verify(publicRefreshToken);
    if (!payloadPriv || !payloadPub || payloadPub.id !== payloadPriv.id) return;
    const user = await User.findById(payloadPub.id);
    if (!user) return;
    return user.id;
  }

  private async createVerificationLink(user: IUser): Promise<string> {
    const token = ts.createVerificationToken(user);
    user.verificationToken = token;
    await user.save();
    return `${APP_BASE_URL || 'http://0.0.0.0:8080'}/business/verify-email?token=${token}`;
  }
}

export const authService = new AuthService();
