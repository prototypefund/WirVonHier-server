import { Schema } from 'mongoose';
import { IBusiness } from '.';
import { normalizeName } from 'modules/util';
import { LocationSchema } from '../location/locationSchema';
import { UserSchema } from '../user/userSchema';
import { Video } from '../video';
// import { GeoService } from 'modules/services';

export const BusinessSchema = new Schema<IBusiness>({
  created: {
    type: String,
    default(): string {
      return new Date(Date.now()).toISOString();
    },
  },
  modified: {
    type: String,
    default(): string {
      return new Date(Date.now()).toISOString();
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
  owner: {
    type: UserSchema,
    required: true,
  },
  members: [UserSchema],
  location: LocationSchema,
  website: {
    type: String,
  },
  phone: {
    type: String,
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
    type: String,
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
  paymentMethods: {
    type: [String],
    enum: ['paypal', 'cash', 'creditcard', 'invoice', 'sofort', 'amazon', 'ondelivery', 'sepa', 'other'],
  },
  media: {
    images: [Image],
    videos: [Video],
  },
});

BusinessSchema.index({ location: '2dsphere' });

// Virtuals
BusinessSchema.virtual('ownerFullName').get(function (this: IBusiness) {
  return '';
});

// Static methods
// BusinessSchema.statics.anyMethod = async function (this: IBusinessModel): Promise<IBusinessPopulated | null> {
//   return '';
// };

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
