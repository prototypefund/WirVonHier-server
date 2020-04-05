import { Document, Model } from 'mongoose';

type ImageType = 'story' | 'profile' | 'banner' | 'mixed';

export interface IImage extends Document {
  created: string;
  modified: string;
  title: string;
  description: string;
  caption: string;
  src: string;
  type: ImageType;
  rank: number;
  ratio: number[];
}

export type IImageModel = Model<IImage>;
