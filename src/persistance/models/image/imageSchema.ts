import { Schema } from 'mongoose';
import { IImage } from '.';
import { imageService } from 'modules/services';

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
  publicId: {
    type: String,
    required: true,
    unique: true,
  },
  rank: Number,
  ratio: {
    type: String,
  },
});

ImageSchema.pre<IImage>('remove', function (next) {
  imageService.deleteImage(this.publicId).then(
    () => next(),
    // eslint-disable-next-line
    (error?: any) => console.error('Error on deleteImage: ', error),
  );
});
