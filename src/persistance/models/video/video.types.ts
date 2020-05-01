import { Document, Model } from 'mongoose';

type VideoType = 'story' | 'profile' | 'banner' | 'mixed';

export interface IVideo extends Document {
  createdAt: string;
  modifiedAt: string;
  name: string;
  description: string;
  path: string;
  host: string;
  type: VideoType;
  rank: number;
  ratio: number[];
}

export type IVideoModel = Model<IVideo>;
