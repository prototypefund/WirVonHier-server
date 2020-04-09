import { Schema } from 'mongoose';
import { IDataProtStatement } from '.';

export const DataProtectionStatementSchema = new Schema<IDataProtStatement>({
  created: {
    type: String,
    default(): string {
      return new Date(Date.now()).toUTCString();
    },
  },
  modified: {
    type: String,
    default(): string {
      return new Date(Date.now()).toUTCString();
    },
  },
  version: {
    type: String,
    requierd: true,
    index: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  text: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['de', 'en'],
  },
});
