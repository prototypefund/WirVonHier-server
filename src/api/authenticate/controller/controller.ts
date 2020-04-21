import { RequestHandler } from 'express-serve-static-core';
import { IAuthenticationController } from './controller.types';
import { authService as as } from 'modules/services';
import { User } from 'persistance/models';

class AuthenticationController implements IAuthenticationController {
  login: RequestHandler = async function login(req, res, next): Promise<void> {
    const type = req.query.strategy || 'local';
    const result = await as.loginUser(type, req, res, next);
    if ('error' in result) return res.status(result.error.status).send(result.error.message).end();
    res.cookie('refresh_token', result.refreshToken, { httpOnly: true });
    return res.status(200).json({ token: result.token }).end();
  };

  /* eslint-disable */
  register: RequestHandler = async function login(req, res): Promise<void> {
    const type = req.query.strategy || 'local';
    const result = await as.registerUser(type, req);
    if ('error' in result) return res.status(result.error.status).send(result.error.message).end();
    res.cookie('refresh_token', result.refreshToken, { httpOnly: true });
    return res.status(200).json({ token: result.token }).end();
  };

  forgotPassword: RequestHandler = async function forgotPassword(req, res): Promise<void> {
    const { status, message } = await as.forgotPassword(req);
    res.status(status).json({ message });
  };

  refreshToken: RequestHandler = async function refreshToken(req, res): Promise<void> {
    const result = await as.refreshToken(req);
    if ('error' in result) return res.status(result.error.status).send(result.error.message).end();
    res.cookie('refresh_token', result.refreshToken, { httpOnly: true });
    return res.status(200).json({ token: result.token }).end();
  }

  verify: RequestHandler = async function verify(req, res): Promise<void> {
    const result = await as.verifyUserEmail(req);
    if ('error' in result) return res.status(result.error.status).send(result.error.message).end();
    return res.status(204).end();
  }

  resendVerification: RequestHandler = async function resendVerification(req, res): Promise<void> {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(406).send(`No User found for email "${req.body.email}`).end();
    const result = await as.sendVerificationEmail(user);
    if ('error' in result) return res.status(result.error.status).send(result.error.message).end();
    return res.status(204).end();
  }
}

export const authenticationController = new AuthenticationController();
