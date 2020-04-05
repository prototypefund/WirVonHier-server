import { Document, Model } from 'mongoose';

export interface ILocation extends Document {
  created: string;
  modified: string;
  type: 'Point';
  coordinates: number[];
}

export type ILocationModel = Model<ILocation>;
