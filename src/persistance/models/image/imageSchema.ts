import { Schema } from 'mongoose';
import { IImage } from '.';

export const ImageSchema = new Schema<IImage>({
  created: {
    type: String,
    default(): string {
      return new Date(Date.now()).toISOString();
    },
  },
  modified: {
    type: String,
    default(): string {
      return new Date(Date.now()).toISOString();
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
