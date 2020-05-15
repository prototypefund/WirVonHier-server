import { Document, Model, Types } from 'mongoose';

export interface ILocation extends Document {
  _id: Types.ObjectId;
  createdAt: string;
  modifiedAt: string;
  type: 'Point';
  coordinates: number[];
}

export type ILocationModel = Model<ILocation>;
