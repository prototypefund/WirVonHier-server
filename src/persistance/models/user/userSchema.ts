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
  refreshToken: {
    type: String,
  },
  roles: {
    type: [String],
    default: ['businessowner'],
  },
  email: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: String,
  username: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  businesses: {
    type: [Schema.Types.ObjectId],
    ref: 'Business',
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
  const first = this.firstName;
  const last = this.lastName;
  return `${first} ${last}`;
});

UserSchema.method('hasOneRole', function (this: IUser, roles: string[]) {
  for (const role of roles) {
    if (this.roles.includes(role)) return true;
  }
  return false;
});
UserSchema.method('hasAllRoles', function (this: IUser, roles: string[]) {
  for (const role of roles) {
    if (!this.roles.includes(role)) return false;
  }
  return true;
});

// Static methods
UserSchema.statics.findMyBusinesses = async function (this: IUserModel, id: string): Promise<IUserPopulated | null> {
  return this.findById(id).populate('businesses').exec();
};

// TODO Write Document Middlewares
// Document middlewares
UserSchema.pre<IUser>('save', async function () {
  if (this.isModified('password')) {
    this.password = await hs.hashPassword(this.password);
  }
});

// TODO Write Query Middlewares
// Query middlewares
UserSchema.post<IUser>('findOneAndUpdate', function (doc) {
  doc.modified = Date.now().toLocaleString();
});
