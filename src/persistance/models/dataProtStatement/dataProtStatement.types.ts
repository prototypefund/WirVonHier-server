import { Document, Model } from 'mongoose';

export enum DataProtLanguageId {
  Deutsch = 'de',
  English = 'en',
}

export interface IDataProtStatement extends Document {
  version: number;
  type: string;
  text: string;
  language: DataProtLanguageId;
}

// For model
export type IDataProtStatementModel = Model<IDataProtStatement>;
