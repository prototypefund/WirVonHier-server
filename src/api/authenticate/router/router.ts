import { Router } from 'express';
import { authenticationController as ac } from '../controller';

export const authenticationRouter = Router();

authenticationRouter.post('/login', ac.login.bind(ac));
authenticationRouter.post('/register', ac.register.bind(ac));
authenticationRouter.post('/logout', ac.logout.bind(ac));
authenticationRouter.post('/request-new-password', ac.requestNewPassword.bind(ac));
authenticationRouter.post('/reset-password', ac.resetPassword.bind(ac));
authenticationRouter.post('/refresh-token', ac.refreshToken.bind(ac));
authenticationRouter.post('/verify-email', ac.verifyEmail.bind(ac));
authenticationRouter.post('/resend-email-verification', ac.resendEmailVerification.bind(ac));
authenticationRouter.get('/me', ac.authenticateMe.bind(ac));
