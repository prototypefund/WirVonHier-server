import { Document, Types, Model } from 'mongoose';
import { IBusiness } from '../business';

interface IUserSchema extends Document {
  firstName: string;
  lastName?: string;
  username: string;
  password: string;
  // leave the company field
  friends: Types.Array<string>;
}

// DO NOT export
interface IUserBase extends IUserSchema {
  fullName: string;
}

// Export this for strong typing
export interface IUser extends IUserBase {
  company: IBusiness['_id'];
}

// Export this for strong typing
export interface IUserPopulated extends IUserBase {
  company: IBusiness;
}

// For model
export interface IUserModel extends Model<IUser> {
  findMyCompany(id: string): Promise<IUserPopulated>;
}
