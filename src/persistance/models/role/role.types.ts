import { Document, Model, Types } from 'mongoose';

export interface IRole extends Document {
  _id: Types.ObjectId;
  createdAt: string;
  modifiedAt: string;
  name: string;
}

export type IRoleModel = Model<IRole>;
