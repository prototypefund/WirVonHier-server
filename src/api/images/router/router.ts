import { Router } from 'express';
import { imagesController as ic } from '../controller';

export const imageRouter = Router();

imageRouter.post(`/image-upload-confirmed`, ic.confirmImageUpload.bind(ic));
