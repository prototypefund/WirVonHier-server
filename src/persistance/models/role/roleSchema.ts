import { Schema } from 'mongoose';
import { IRole } from '.';

export const RoleSchema = new Schema<IRole>({
  name: String,
});
