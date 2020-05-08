import { Router } from 'express';
import { videosController as vc } from '../controller';

export const videoRouter = Router();

videoRouter.post(`/business/:id/video`, vc.uploadVideo.bind(vc));
