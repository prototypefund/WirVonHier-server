import { Schema } from 'mongoose';
import { IImage } from '.';

export const ImageSchema = new Schema<IImage>({
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
  src: {
    type: String,
  },
  publicId: String,
  rank: Number,
  ratio: {
    type: String,
  },
});

// before delete hook: Delete image in cloudinary per publicId!
