import { model } from 'mongoose';
import { IImage, IImageModel } from './image.types';
import { ImageSchema } from './imageSchema';

export const Image = model<IImage, IImageModel>('Image', ImageSchema);
