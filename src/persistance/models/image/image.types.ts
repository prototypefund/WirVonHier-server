import { Document, Model, Types } from 'mongoose';

type ImageType = 'story' | 'profile' | 'logo';

export interface IImage extends Document {
  _id: Types.ObjectId;
  createdAt: string;
  modifiedAt: string;
  publicId: string;
  title: string;
  description: string;
  businessId: Types.ObjectId;
  imageType: ImageType;

  // This property indicates whether the ImageFile was successfully uploaded to Cloudinary
  uploadVerified: boolean;
}

export type IImageModel = Model<IImage>;
