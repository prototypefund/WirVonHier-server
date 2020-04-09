import { Schema } from 'mongoose';
import { ILocation } from '.';

export const LocationSchema = new Schema<ILocation>({
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
