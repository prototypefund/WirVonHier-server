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
  businessId: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  imageType: {
    type: String,
    required: true,
    enum: ['logo', 'profile', 'story'],
  },
  publicId: {
    type: String,
    required: true,
    unique: true,
  },
  uploadVerified: {
    type: Boolean,
    default: false,
  },
});

// Document middlewares
ImageSchema.pre<IImage>('save', function () {
  this.modifiedAt = Date.now().toLocaleString();
});
