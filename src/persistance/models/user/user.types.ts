import { Document, Types, Model } from 'mongoose';
import { IBusiness } from '../business';
import { IRole } from '../role';
import { IDataProtStatement } from '../dataProtStatement';
import { RoleName } from '../role/role.types';

interface IUserSchema extends Document {
  _id: Types.ObjectId;
  createdAt: string;
  modifiedAt: string;
  resetPasswordToken?: string;
  email: string;
  roles: Array<IRole['name']>;
  firstName?: string;
  lastName?: string;
  username?: string;
  password: string;
  acceptedDataProtStatement: Array<IDataProtStatement['_id']>;
  // leave the company field
  friends: Types.Array<string>;
  verification: {
    [key: string]: string | null;
    email: string | null;
  };
  isVerified: boolean;
}

// DO NOT export
interface IUserBase extends IUserSchema {
  fullName: string;
  hasAllRoles(roles: RoleName[]): boolean;
  hasOneRole(roles: RoleName[]): boolean;
}

// Export this for strong typing
export interface IUser extends IUserBase {
  businesses: Array<IBusiness['_id']>;
}

// Export this for strong typing
export interface IUserPopulated extends IUserBase {
  businesses: Array<IBusiness>;
}

// For model
export interface IUserModel extends Model<IUser> {
  findMyCompanies(id: string): Promise<IUserPopulated>;
}
