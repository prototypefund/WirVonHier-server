import { Document, Model, Types } from 'mongoose';

type VideoStatusType = 'complete' | 'uploaded' | 'transcoding' | 'error' | 'init';

export interface IVideo extends Document {
  _id: Types.ObjectId;
  createdAt: string;
  modifiedAt: string;
  businessId: Types.ObjectId;
  description: string;
  vimeoURI: string;
  status: VideoStatusType;
  url: string;
}

export type IVideoModel = Model<IVideo>;
