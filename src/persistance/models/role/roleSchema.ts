import { Schema } from 'mongoose';
import { IRole } from '.';

export const RoleSchema = new Schema<IRole>({
  created: {
    type: String,
    default(): string {
      return new Date(Date.now()).toISOString();
    },
  },
  modified: {
    type: String,
    default(): string {
      return new Date(Date.now()).toISOString();
    },
  },
  name: String,
});
