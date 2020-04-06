import { model } from 'mongoose';
import { IVideo, IVideoModel } from './video.types';
import { VideoSchema } from './videoSchema';

export const Video = model<IVideo, IVideoModel>('Video', VideoSchema);
