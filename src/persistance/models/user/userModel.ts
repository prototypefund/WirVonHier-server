import { model } from 'mongoose';
import { IUser, IUserModel } from './user.types';
import { UserSchema } from './userSchema';

export const User = model<IUser, IUserModel>('User', UserSchema);
