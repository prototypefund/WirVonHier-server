import { Schema } from 'mongoose';
import { IImage } from '.';

export const ImageSchema = new Schema<IImage>({
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
  publicId: String,
  rank: Number,
  ratio: {
    type: String,
  },
});
