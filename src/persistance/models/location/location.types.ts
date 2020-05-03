import { Document, Model } from 'mongoose';

export interface ILocation extends Document {
  createdAt: string;
  modifiedAt: string;
  type: 'Point';
  coordinates: number[];
}

export type ILocationModel = Model<ILocation>;
