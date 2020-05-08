import { Document, Model } from 'mongoose';

type VideoType = 'story' | 'profile' | 'banner' | 'mixed';
type VideoStatusType = 'complete' | 'transcoding' | 'uploading' | 'init';

export interface IVideo extends Document {
  createdAt: string;
  modifiedAt: string;
  name: string;
  description: string;
  path: string;
  src: string;
  videoId: string;
  status: VideoStatusType;
  host: string;
  type: VideoType;
  rank: number;
  ratio: number[];
}

export type IVideoModel = Model<IVideo>;
