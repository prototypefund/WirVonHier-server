import { RequestHandler } from 'express-serve-static-core';
import { IAuthenticationController } from './controller.types';
import { authService as as } from 'modules/services';

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
}

export const authenticationController = new AuthenticationController();
