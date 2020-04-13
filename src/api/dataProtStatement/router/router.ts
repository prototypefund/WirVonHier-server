import { Router } from 'express';
import { dataProtstatementController as dpsc } from '../controller';

export const dataProtstatementRouter = Router();

dataProtstatementRouter.get(`/data-prot-statements`, dpsc.getStatement.bind(dpsc));
