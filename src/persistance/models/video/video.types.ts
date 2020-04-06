import { Document, Model } from 'mongoose';

type VideoType = 'story' | 'profile' | 'banner' | 'mixed';

export interface IVideo extends Document {
  created: string;
  modified: string;
  name: string;
  description: string;
  path: string;
  host: string;
  type: VideoType;
  rank: number;
  ratio: number[];
}

export type IVideoModel = Model<IVideo>;
