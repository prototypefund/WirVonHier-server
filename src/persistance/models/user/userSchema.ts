import { Schema } from 'mongoose';
import { IUser } from '.';
import { IUserPopulated, IUserModel } from './user.types';
import { hashingService as hs } from 'modules/services';

export const UserSchema = new Schema<IUser>({
  created: {
    type: String,
    required: true,
    default(): string {
      return new Date(Date.now()).toLocaleString();
    },
  },
  modified: {
    type: String,
    required: true,
    default(): string {
      return new Date(Date.now()).toLocaleString();
    },
  },
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
  businesses: {
    type: Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
  },
  acceptedDataProtStatements: {
    type: [Schema.Types.ObjectId],
    ref: 'DataProtStatement',
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
UserSchema.statics.findMyCompanies = async function (this: IUserModel, id: string): Promise<IUserPopulated | null> {
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
  doc.modified = Date.now().toLocaleString();
});
