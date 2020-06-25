import { NextFunction, Request, Response } from 'express-serve-static-core';
import { IAuthResponse, IAuthErrorResponse } from './authService.types';
import * as providers from './providers';
import { tokenService as ts, mailService } from 'modules/services';
import { getEmailVerificationBody } from './emailTemplates/emailVerification';
import { getResetPasswordBody } from './emailTemplates/resetPassword';
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
    return providers.local.requestNewPassword.call(this, req);
  }
  async resetPassword(req: Request): Promise<{ status: number; message?: string }> {
    return providers.local.resetPassword.call(this, req);
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
    user.verification.email = new Date().toUTCString();
    user.save();
    return { verified: user.verification.email };
  }

  async sendVerificationEmail(user: IUser): Promise<{ to: string } | IAuthErrorResponse> {
    try {
      const verificationLink = this.createVerificationLink(user);
      const bodyOptions = {
        link: verificationLink,
      };
      await mailService.send({
        to: user.email,
        from: 'info',
        subject: 'HändlerRegistrierung WirVonHier.net',
        html: getEmailVerificationBody(bodyOptions),
      });
      return { to: user.email };
    } catch (e) {
      return { error: { status: 400, message: e.message } };
    }
  }

  async sendResetPasswordMail(user: IUser): Promise<{ to: string } | IAuthErrorResponse> {
    try {
      const resetPasswordLink = await this.createForgotPasswordLink(user);

      const bodyOptions = {
        link: resetPasswordLink,
      };
      await mailService.send({
        to: user.email,
        from: `service`,
        subject: 'Passwort vergessen',
        html: getResetPasswordBody(bodyOptions),
      });
      return { to: user.email };
    } catch (e) {
      return { error: { status: 400, message: e.message } };
    }
  }

  async sendPasswordChangedEmail(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;
    const data = {
      to: user.email,
      from: `service`,
      subject: 'Passwort erfolgreich geändert',
      html: `Your Password has been successfully changed.`,
    };
    await mailService.send(data);
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

  private createVerificationLink(user: IUser): string {
    const token = ts.createVerificationToken(user);
    return `${APP_BASE_URL || 'http://0.0.0.0:8080'}/verify-email?token=${token}`;
  }
  private async createForgotPasswordLink(user: IUser): Promise<string> {
    const token = ts.createResetPasswordToken(user);
    user.resetPasswordToken = token;
    await user.save();
    return `${APP_BASE_URL || 'http://0.0.0.0:8080'}/reset-password?token=${token}`;
  }
}

export const authService = new AuthService();
