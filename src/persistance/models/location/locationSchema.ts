import { Schema } from 'mongoose';
import { ILocation } from '.';

export const LocationSchema = new Schema<ILocation>({
  type: {
    type: String,
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [lng, lat]
    required: true,
  },
});
