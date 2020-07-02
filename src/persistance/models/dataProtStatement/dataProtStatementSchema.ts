import { Schema } from 'mongoose';
import { IDataProtStatement } from '.';

export const DataProtectionStatementSchema = new Schema<IDataProtStatement>({
  createdAt: {
    type: String,
    default(): string {
      return new Date(Date.now()).toUTCString();
    },
  },
  modifiedAt: {
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
  html: {
    type: String,
    required: true,
  },
  markdown: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['de', 'en'],
  },
});
