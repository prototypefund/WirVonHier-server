import { Document, Model } from 'mongoose';
import { ILocation, IVideo } from '..';
import { IImage } from '../image';

interface IBusinessSchema extends Document {
  id: string;
  created: string;
  modified: string;
  name: string;
  location: ILocation;
  website: string;
  phone: string;
  whatsApp: string;
  instagram: string;
  facebook: string;
  twitter: string;
  email: string;
  address: {
    street: string;
    streetNumber: string;
    zip: string;
    city: string;
    state: string;
    country: string;
  };
  description: string;
  delivery: string[];
  category: string[];
  // analytic fields
  // Activity of business
  // time-viewed
  // users visited
  //
}

export interface IBusinessBase extends IBusinessSchema {
  fullAddress: string;
}

export interface IBusiness extends IBusinessBase {
  media: {
    images: IImage['id'][];
    videos: IVideo['id'][];
  };
}

export interface IBusinessPopulated extends IBusinessBase {
  sompePopulatedValue: unknown;
}

export interface IBusinessModel extends Model<IBusiness> {
  anyMethod(id: string): Promise<IBusinessPopulated>;
}
