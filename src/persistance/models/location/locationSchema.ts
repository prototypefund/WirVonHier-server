import { Schema } from 'mongoose';
import { ILocation } from '.';

export const LocationSchema = new Schema<ILocation>({
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
  geo: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },
});

LocationSchema.index({ geo: '2dsphere' });

// Document middlewares
LocationSchema.pre<ILocation>('save', function () {
  this.modifiedAt = Date.now().toLocaleString();
});
