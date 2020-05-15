import { Document, Model, Types } from 'mongoose';

type ImageType = 'story' | 'profile' | 'banner' | 'mixed';

export interface IImage extends Document {
  _id: Types.ObjectId;
  createdAt: string;
  modifiedAt: string;
  title: string;
  description: string;
  caption: string;
  src: string;
  type: ImageType;
  rank: number;
  ratio: number[];
  publicId: string;
}

export type IImageModel = Model<IImage>;
