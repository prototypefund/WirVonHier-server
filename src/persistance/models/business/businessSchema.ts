import { Schema } from 'mongoose';
import { IBusiness } from '.';
import { IBusinessPopulated, IBusinessModel } from './business.types';

export const BusinessSchema = new Schema<IBusiness>({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  contact: {
    phone: [String],
    email: [String],
    address: {
      street: String,
      streetNumber: String,
      zip: String,
      city: String,
      state: String,
      country: String,
    },
  },
  media: {
    images: {},
    video: {},
  },
});

// Virtuals
BusinessSchema.virtual('something').get(function (this: IBusiness) {
  return this.name + this.contact.phone;
});

// Static methods
BusinessSchema.statics.anyMethod = async function (
  this: IBusinessModel,
  id: string,
): Promise<IBusinessPopulated | null> {
  return this.findById(id).populate('company').exec();
};

// Document pre Hook
BusinessSchema.pre<IBusiness>('save', function () {
  // some pre hook
});

// Document post Hook
BusinessSchema.post<IBusiness>('findOneAndUpdate', function () {
  // Do anything
});
