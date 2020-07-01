import { ImageType } from 'modules/services/image';

export interface IUpdateBusinessImagePayload {
  title?: string;
  description?: string;
  uploadVerified?: boolean;
}

export type ICreateBusinessImagePayload = {
  publicId: string;
  title: string;
  businessId: string;
  description?: string;
  imageType: ImageType;
};
