import { Schema } from 'mongoose';
import { IUser } from '.';
import { IUserPopulated, IUserModel } from './user.types';
import { hashingService as hs } from 'modules/services';
import { RoleName } from '../role/role.types';

export const UserSchema = new Schema<IUser>(
  {
    createdAt: {
      type: String,
      required: true,
      default(): string {
        return new Date(Date.now()).toLocaleString();
      },
    },
    modifiedAt: {
      type: String,
      required: true,
      default(): string {
        return new Date(Date.now()).toLocaleString();
      },
    },
    resetPasswordToken: {
      type: String,
    },
    verification: {
      email: {
        type: String,
      },
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
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

// Virtuals
UserSchema.virtual('fullName').get(function (this: IUser) {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});
UserSchema.virtual('isVerified').get(function (this: IUser) {
  return Object.keys(this.verification)
    .filter((key) => key !== '$init')
    .some((key) => this.verification[key]);
});

UserSchema.method('hasOneRole', function (this: IUser, roles: RoleName[]) {
  for (const role of roles) {
    if (this.roles.includes(role)) return true;
  }
  return false;
});
UserSchema.method('hasAllRoles', function (this: IUser, roles: RoleName[]) {
  for (const role of roles) {
    if (!this.roles.includes(role)) return false;
  }
  return true;
});

// Static methods
UserSchema.statics.findMyBusinesses = function (this: IUserModel, id: string): IUserPopulated | null {
  return (this.findById(id).populate('businesses').exec() as unknown) as IUserPopulated;
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
  doc.modifiedAt = Date.now().toLocaleString();
});
