import { Router } from 'express';
import { imagesController as ic } from '../controller';

export const imageRouter = Router();

imageRouter.post(`/images`, ic.createImages.bind(ic));
imageRouter.patch(`/images/:id`, ic.updateImage.bind(ic));
imageRouter.delete(`/images/:id`, ic.deleteImage.bind(ic));
