import { Schema } from 'mongoose';
import { ILocation } from '.';

export const LocationSchema = new Schema<ILocation>({
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
  type: {
    type: String,
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [lng, lat]
    required: true,
  },
});
