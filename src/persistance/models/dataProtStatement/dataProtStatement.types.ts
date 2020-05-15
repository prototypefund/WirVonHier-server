import { Document, Model, Types } from 'mongoose';

export enum DataProtLanguageId {
  Deutsch = 'de',
  English = 'en',
}

export interface IDataProtStatement extends Document {
  _id: Types.ObjectId;
  createdAt: string;
  modifiedAt: string;
  version: string;
  type: string;
  text: string;
  language: DataProtLanguageId;
}

// For model
export type IDataProtStatementModel = Model<IDataProtStatement>;
