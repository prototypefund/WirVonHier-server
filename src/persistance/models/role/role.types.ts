import { Document, Model } from 'mongoose';

export interface IRole extends Document {
  name: string;
}

export type IRoleModel = Model<IRole>;
