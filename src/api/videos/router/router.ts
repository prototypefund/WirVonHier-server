import { Router } from 'express';
import { videosController as vc } from '../controller';

export const videoRouter = Router();

videoRouter.post(`/business/:businessId/video`, vc.uploadVideo.bind(vc));
videoRouter.delete(`/business/:businessId/video/:videoId`, vc.deleteVideo.bind(vc));
