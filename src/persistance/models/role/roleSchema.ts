import { Schema } from 'mongoose';
import { IRole } from '.';

export const RoleSchema = new Schema<IRole>({
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
  name: String,
});
