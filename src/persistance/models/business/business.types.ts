import { Document, Model } from 'mongoose';
import { ILocation, IVideo, IUser } from '..';
import { IImage } from '../image';

interface IBusinessSchema extends Document {
  id: string;
  created: string;
  modified: string;
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
  location: ILocation['_id'];
  media: {
    logo: IImage['_id'];
    cover: {
      image: IImage['_id'];
      video: IVideo['_id'];
    };
    profile: {
      image: IImage['_id'];
      video: IVideo['_id'];
    };
    stories: {
      images: IImage['_id'][];
      videos: IVideo['_id'][];
    };
  };
}

export interface IBusinessPopulated extends IBusinessBase {
  owner: IUser;
  location: ILocation;
  media: {
    logo: IImage;
    cover: {
      image: IImage;
      video: IVideo;
    };
    profile: {
      image: IImage;
      video: IVideo;
    };
    stories: {
      images: IImage[];
      videos: IVideo[];
    };
  };
}

export interface IBusinessModel extends Model<IBusiness> {
  anyMethod(id: string): Promise<IBusinessPopulated>;
}
