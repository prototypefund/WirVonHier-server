import { Document, Model } from 'mongoose';
import { ILocation, IVideo, IUser } from '..';
import { IImage } from '../image';

interface IBusinessSchema extends Document {
  id: string;
  created: string;
  modified: string;
  name: string;
  ownerFirstName: string;
  ownerLastName: string;
  location: ILocation;
  website: string;
  onlineShop: string;
  phone: string;
  whatsApp: string;
  instagram: string;
  facebook: string;
  twitter: string;
  email: string;
  otherContacts: string;
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
  paymentMethods: string[];
  category: string | string[];
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
  owner: IUser['_id'];
  media: {
    images: IImage['id'][];
    videos: IVideo['id'][];
  };
}

export interface IBusinessPopulated extends IBusinessBase {
  owner: IUser;
  media: {
    images: IImage[];
    videos: IVideo[];
  };
}

export interface IBusinessModel extends Model<IBusiness> {
  anyMethod(id: string): Promise<IBusinessPopulated>;
}
