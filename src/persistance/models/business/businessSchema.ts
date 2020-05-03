import { Schema } from 'mongoose';
import { IBusiness } from '.';
import { normalizeName } from 'modules/util';
import { geoService } from 'modules';

export const BusinessSchema = new Schema<IBusiness>(
  {
    createdAt: {
      type: String,
      default(): string {
        return new Date(Date.now()).toUTCString();
      },
    },
    modifiedAt: {
      type: String,
      default(): string {
        return new Date(Date.now()).toUTCString();
      },
    },
    active: {
      type: Boolean,
      default: false,
    },
    verification: {
      email: {
        type: String,
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dataProtStatement: String,
    ownerFirstName: String,
    ownerLastName: String,
    members: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
    },
    distance: {
      type: Number,
    },
    onlineShop: String,
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
      enum: ['collect', 'delivery'],
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
      logo: {
        type: Schema.Types.ObjectId,
        ref: 'Image',
      },
      cover: {
        image: {
          type: Schema.Types.ObjectId,
          ref: 'Image',
        },
        video: {
          type: Schema.Types.ObjectId,
          ref: 'Video',
        },
      },
      profile: {
        image: {
          type: Schema.Types.ObjectId,
          ref: 'Image',
        },
        video: {
          type: Schema.Types.ObjectId,
          ref: 'Video',
        },
      },
      stories: {
        images: {
          type: [Schema.Types.ObjectId],
          ref: 'Image',
        },
        videos: {
          type: [Schema.Types.ObjectId],
          ref: 'Video',
        },
      },
    },
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
BusinessSchema.virtual('verified').get(function (this: IBusiness) {
  return Object.keys(this.verification)
    .filter((key) => key !== '$init')
    .some((key) => this.verification[key]);
});

BusinessSchema.method('setDistance', function (this: IBusiness, distance: number) {
  this.distance = distance;
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
  if (this.isModified('address')) {
    geoService.queueForGeolocation([this]);
  }
});

// Document post Hook
BusinessSchema.post<IBusiness>('save', function (doc) {
  doc.modifiedAt = new Date(Date.now()).toUTCString();
});
