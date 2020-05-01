import { Document, Model } from 'mongoose';

export enum DataProtLanguageId {
  Deutsch = 'de',
  English = 'en',
}

export interface IDataProtStatement extends Document {
  createdAt: string;
  modifiedAt: string;
  version: string;
  type: string;
  text: string;
  language: DataProtLanguageId;
}

// For model
export type IDataProtStatementModel = Model<IDataProtStatement>;
