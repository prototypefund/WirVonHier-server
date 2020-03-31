import { Document, Model } from 'mongoose';

interface IBusinessSchema extends Document {
  name: string;
  lat: string;
  long: string;
  contact: {
    phone: string[];
    email: string[];
    address: {
      street: string;
      streetNumber: string;
      zip: string;
      city: string;
      state: string;
      country: string;
    };
  };
  media: {
    images: {};
    video: {};
  };
}

export interface IBusinessBase extends IBusinessSchema {
  fullAddress: string;
}

export interface IBusiness extends IBusinessBase {
  sompePopulatedValue: string; // as ID
}

export interface IBusinessPopulated extends IBusinessBase {
  sompePopulatedValue: unknown;
}

export interface IBusinessModel extends Model<IBusiness> {
  any: string;
}

export interface IBusinessModel extends Model<IBusiness> {
  anyMethod(id: string): Promise<IBusinessPopulated>;
}
