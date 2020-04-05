import { Document, Model } from 'mongoose';

export interface IRole extends Document {
  created: string;
  modified: string;
  name: string;
}

export type IRoleModel = Model<IRole>;
