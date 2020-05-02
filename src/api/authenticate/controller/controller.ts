import { RequestHandler } from 'express-serve-static-core';
import { IAuthenticationController } from './controller.types';
import { authService as as } from 'modules/services';
import { User } from 'persistance/models';

class AuthenticationController implements IAuthenticationController {
  login: RequestHandler = async function login(req, res, next): Promise<void> {
    const type = req.query.strategy || 'local';
    const result = await as.loginUser(type, req, res, next);
    if ('error' in result) return res.status(result.error.status).send(result.error.message).end();
    res.cookie('refresh_token', result.refreshToken, { httpOnly: true, domain: APP_DOMAIN });
    res.cookie('public_refresh_token', result.publicRefreshToken, { domain: APP_DOMAIN });
    return res.status(200).json({ token: result.token }).end();
  };

  /* eslint-disable */
  register: RequestHandler = async function login(req, res): Promise<void> {
    const type = req.query.strategy || 'local';
    const result = await as.registerUser(type, req);
    if ('error' in result) return res.status(result.error.status).send(result.error.message).end();
    res.cookie('refresh_token', result.refreshToken, { httpOnly: true, domain: APP_DOMAIN });
    res.cookie('public_refresh_token', result.publicRefreshToken, { domain: APP_DOMAIN });
    return res.status(200).json({ token: result.token }).end();
  };

  logout: RequestHandler = async function logout(_req, res): Promise<void> {
    res.clearCookie('refresh_token', { httpOnly: true, domain: APP_DOMAIN });
    res.clearCookie('public_refresh_token', { domain: APP_DOMAIN });
    return res.status(204).end();
  }

  requestNewPassword: RequestHandler = async function requestNewPassword(req, res): Promise<void> {
    const { status, message } = await as.requestNewPassword(req);
    res.status(status).json({ message });
  };

  resetPassword: RequestHandler = async function resetPassword(req, res): Promise<void> {
    const { status, message } = await as.resetPassword(req);
    res.status(status).json({ message });
  };

  refreshToken: RequestHandler = async function refreshToken(req, res): Promise<void> {
    const result = await as.refreshToken(req);
    if ('error' in result) return res.status(result.error.status).send(result.error.message).end();
    res.cookie('refresh_token', result.refreshToken, { httpOnly: true, domain: APP_DOMAIN });
    res.cookie('public_refresh_token', result.publicRefreshToken, { domain: APP_DOMAIN });
    return res.status(200).json({ token: result.token }).end();
  }

  verifyEmail: RequestHandler = async function verifyEmail(req, res): Promise<void> {
    const result = await as.verifyUserEmail(req);
    if ('error' in result) return res.status(result.error.status).send(result.error.message).end();
    return res.status(204).json({ verified: result.verified }).end();
  }

  resendEmailVerification: RequestHandler = async function resendEmailVerification(req, res): Promise<void> {
    if (!req.token) return res.status(401).end();
    const user = await User.findById(req.token.id);
    if (!user) return res.status(406).send(`Unable to send email to "${req.body.email}"`).end();
    const result = await as.sendVerificationEmail(user);
    if ('error' in result) return res.status(result.error.status).send(result.error.message).end();
    return res.status(204).json({ email: result.to }).end();
  }

  authenticateMe: RequestHandler = async function authenticateMe(req, res): Promise<void> {
    const userId = await as.authenticateMe(req);
    if (userId) return res.status(200).json({ id: userId }).end();
    return res.status(401).end();
  }
}

export const authenticationController = new AuthenticationController();
