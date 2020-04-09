import { Schema } from 'mongoose';
import { IVideo } from '.';

export const VideoSchema = new Schema<IVideo>({
  created: {
    type: String,
    default(): string {
      return new Date(Date.now()).toUTCString();
    },
  },
  modified: {
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
  src: {
    type: String,
    required: true,
  },
  rank: Number,
  ratio: {
    type: String,
  },
});
