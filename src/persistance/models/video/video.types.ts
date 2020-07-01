import { Document, Model, Types } from 'mongoose';

type VideoType = 'story';
type VideoStatusType = 'complete' | 'transcoding' | 'uploading' | 'init';

export interface IVideo extends Document {
  _id: Types.ObjectId;
  createdAt: string;
  modifiedAt: string;
  owner: Types.ObjectId;
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
