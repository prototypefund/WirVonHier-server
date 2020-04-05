import { Document, Model } from 'mongoose';
import { ILocation } from '..';

interface IBusinessSchema extends Document {
  id: string;
  created: string;
  modified: string;
  name: string;
  location: ILocation;
  website: string;
  phone: string[];
  whatsApp: string;
  instagram: string;
  facebook: string;
  twitter: string;
  email: string[];
  address: {
    street: string;
    streetNumber: string;
    zip: string;
    city: string;
    state: string;
    country: string;
  };
  ownerFirstName: string;
  ownerLastName: string;
  ownerFullName: string;
  description: string;
  delivery: string[];
  category: string[];
  images: {};
  video: {};
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
