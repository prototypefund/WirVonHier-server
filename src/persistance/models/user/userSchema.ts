import { Schema } from 'mongoose';
import { IUser } from '.';
import { IUserPopulated, IUserModel } from './user.types';
import { hashingService as hs } from 'modules/services';

export const UserSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,
  },
  lastName: String,
  username: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  friends: [
    {
      type: String,
    },
  ],
});

// Virtuals
UserSchema.virtual('fullName').get(function (this: IUser) {
  return this.firstName + this.lastName;
});

// Static methods
UserSchema.statics.findMyCompany = async function (this: IUserModel, id: string): Promise<IUserPopulated | null> {
  return this.findById(id).populate('company').exec();
};

// TODO Write Document Middlewares
// Document middlewares
UserSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hs.hashPassword(this.password);
    next();
  }
});

// TODO Write Query Middlewares
// Query middlewares
UserSchema.post<IUser>('findOneAndUpdate', function (doc) {
  // Do anything
  doc;
});
