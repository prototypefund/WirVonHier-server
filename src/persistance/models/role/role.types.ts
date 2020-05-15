import { Document, Model, Types } from 'mongoose';

export interface IRole extends Document {
  _id: Types.ObjectId;
  createdAt: string;
  modifiedAt: string;
  name: RoleName;
}

export type RoleName = 'admin' | 'businessowner';
export type IRoleModel = Model<IRole>;
