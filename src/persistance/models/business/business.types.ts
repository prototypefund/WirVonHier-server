import { Document, Model, Types } from 'mongoose';
import { ILocation, IVideo, IUser } from '..';
import { IImage } from '../image';

export interface IBusinessMedia {
  logo: IImage['_id'] | null;
  cover: {
    image: IImage['_id'] | null | undefined;
    video: IVideo['_id'] | null | undefined;
  };
  profile: {
    video: IVideo['_id'] | null | undefined;
    image: IImage['_id'] | null | undefined;
  };
  stories: {
    images: IImage['_id'][];
    videos: IVideo['_id'][];
  };
}

export interface IBusinessMediaPopulated {
  logo: IImage;
  cover: {
    image: IImage | undefined;
    video: IVideo | undefined;
  };
  profile: {
    image: IImage | undefined;
    video: IVideo | undefined;
  };
  stories: {
    images: IImage[];
    videos: IVideo[];
  };
}

interface IBusinessSchema extends Document {
  _id: Types.ObjectId;
  id: string;
  createdAt: string;
  modifiedAt: string;
  verification: {
    [key: string]: string | null;
    email: string | null;
  };
  active: boolean;
  verified: boolean;
  name: string;
  distance?: number;
  ownerFirstName: string;
  ownerLastName: string;
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
  setDistance: (distance: number) => void;
}

export interface IBusinessBase extends IBusinessSchema {
  fullAddress: string;
}

export interface IBusiness extends IBusinessBase {
  owner: IUser['_id'];
  members: Array<IUser['_id']>;
  location: ILocation['_id'] | null;
  media: IBusinessMedia;
}

export interface IBusinessPopulated extends IBusinessBase {
  owner: IUser;
  members: IUser[];
  location: ILocation | null;
  media: IBusinessMediaPopulated;
}

export interface IBusinessModel extends Model<IBusiness> {
  anyMethod(id: string): Promise<IBusinessPopulated>;
}
