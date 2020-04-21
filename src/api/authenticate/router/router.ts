import { Router } from 'express';
import { authenticationController as ac } from '../controller';

export const authenticationRouter = Router();

authenticationRouter.post('/login', ac.login.bind(ac));
authenticationRouter.post('/register', ac.register.bind(ac));
authenticationRouter.post('/forgot-password', ac.forgotPassword.bind(ac));
authenticationRouter.post('/refresh-token', ac.refreshToken.bind(ac));
authenticationRouter.post('/verify', ac.verify.bind(ac));
authenticationRouter.post('/resend-verification', ac.resendVerification.bind(ac));
