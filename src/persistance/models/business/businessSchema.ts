import { Schema } from 'mongoose';
import { IBusiness } from '.';
import { IBusinessPopulated, IBusinessModel } from './business.types';
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
  name: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  lat: {
    type: Number,
    index: true,
    required: true,
  },
  lng: {
    type: Number,
    index: true,
    required: true,
  },
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

// // Document pre Hook
// BusinessSchema.pre<IBusiness>('save', function (_next, doc: Partial<IBusiness>) {
//   if (doc.address) {
//     const { lat, lang } = GeoService.getCoordinates(doc.address);
//     this.lat = lat;
//     this.lng = lang;
//   }
// });

// Document post Hook
BusinessSchema.post<IBusiness>('save', function (doc) {
  doc.modified = Date.now().toLocaleString();
});
