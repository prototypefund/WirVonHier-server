import { IImage } from 'persistance/models/image/image.types';

export type ImageType = 'profile' | 'story' | 'logo';

export type UpdateImagePayload = Partial<IImage>;

export type ICreateImagePayload = {
  publicId: string;
  title: string;
  businessId: string;
  description?: string;
  imageType: ImageType;
};
