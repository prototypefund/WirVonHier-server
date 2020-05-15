import { IRole } from 'persistance/models';
import { Types } from 'mongoose';

export interface ITokenPayload {
  id: Types.ObjectId | string;
  email?: string;
  roles?: Array<IRole['name']>;
  type?: string;
}
