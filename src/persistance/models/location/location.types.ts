import { Document, Model } from 'mongoose';

export interface ILocation extends Document {
  location: {
    type: 'Point';
    coordinates: number[];
  };
}

export type ILocationModel = Model<ILocation>;
