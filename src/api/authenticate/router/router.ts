import { Router } from 'express';
import { authenticationController as ac } from '../controller';

export const authenticationRouter = Router();

authenticationRouter.post('/login', ac.login.bind(ac));
authenticationRouter.post('/register', ac.register.bind(ac));
