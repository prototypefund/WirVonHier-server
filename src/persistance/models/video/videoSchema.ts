import { Schema } from 'mongoose';
import { IVideo } from '.';

export const VideoSchema = new Schema<IVideo>({
  createdAt: {
    type: String,
    default(): string {
      return new Date(Date.now()).toUTCString();
    },
  },
  modifiedAt: {
    type: String,
    default(): string {
      return new Date(Date.now()).toUTCString();
    },
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  caption: String,
  src: String,
  videoId: String,
  status: String,
  rank: Number,
  ratio: {
    type: String,
  },
});
