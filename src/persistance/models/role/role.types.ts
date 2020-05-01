import { Document, Model } from 'mongoose';

export interface IRole extends Document {
  createdAt: string;
  modifiedAt: string;
  name: string;
}

export type IRoleModel = Model<IRole>;
