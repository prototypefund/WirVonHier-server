import { Schema } from 'mongoose';
import { IBusiness } from '.';
import { IBusinessPopulated, IBusinessModel } from './business.types';
import { normalizeName } from 'modules/util';
import { LocationSchema } from '../location/locationSchema';
// import { GeoService } from 'modules/services';

export const BusinessSchema = new Schema<IBusiness>({
  created: {
    type: String,
    default(): string {
      return new Date(Date.now()).toLocaleString();
    },
  },
  modified: {
    type: String,
    default(): string {
      return new Date(Date.now()).toLocaleString();
    },
  },
  id: {
    type: String,
    requierd: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  location: LocationSchema,
  website: {
    type: String,
  },
  phone: {
    type: [String],
    required: true,
  },
  whatsApp: {
    type: String,
  },
  instagram: {
    type: String,
  },
  facebook: {
    type: String,
  },
  twitter: {
    type: String,
  },
  email: {
    type: [String],
    required: true,
  },
  address: {
    street: String,
    streetNumber: String,
    zip: String,
    city: String,
    state: String,
    country: String,
  },
  ownerFirstName: {
    type: String,
  },
  ownerLastName: {
    type: String,
  },
  description: {
    type: String,
    maxlength: 1500,
  },
  delivery: {
    type: [String],
    enum: ['collect', 'deliveryByOwner', 'deliveryByService'],
  },
  category: {
    type: [String],
    // enum: ['food', 'beverages', 'clothing', 'lifestyle', 'accessories', 'crafts', 'service', 'hairdresse', 'education'],
    required: true,
  },
  images: {
    type: [String],
  },
  videos: {
    type: [String],
  },
});

BusinessSchema.index({ location: '2dsphere' });

// Virtuals
BusinessSchema.virtual('ownerFullName').get(function (this: IBusiness) {
  return this.ownerFirstName + ' ' + this.ownerLastName;
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
  if (this.isModified('name')) {
    this.id = normalizeName(this.name);
  }
});

// Document post Hook
BusinessSchema.post<IBusiness>('save', function (doc) {
  doc.modified = Date.now().toLocaleString();
});
