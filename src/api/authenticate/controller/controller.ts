import { RequestHandler } from 'express-serve-static-core';
import { IAuthenticationController } from './controller.types';
import { authService as as } from 'modules/services';

class AuthenticationController implements IAuthenticationController {
  login: RequestHandler = async function login(req, res, next): Promise<void> {
    const type = req.query.strategy || 'local';
    const { token, error } = await as.loginUser(type, req, res, next);
    if (error) res.status(error.status).send(error.message);
    if (token) res.status(200).json({ token });
  };

  register: RequestHandler = async function login(req, res, next): Promise<void> {
    const type = req.query.strategy || 'local';
    const { token, error } = await as.registerUser(type, req, res, next);
    if (error) res.status(error.status).send(error.message);
    if (token) res.status(200).json({ token });
  };

  forgotPassword: RequestHandler = async function forgotPassword(req, res, next): Promise<void> {
    const { status, message } = await as.forgotPassword(req, res, next);
    res.status(status).json({ message });
  };
}

export const authenticationController = new AuthenticationController();
