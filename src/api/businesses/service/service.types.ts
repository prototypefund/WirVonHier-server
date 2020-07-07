import { ImageType } from 'modules/services/image';
import { IVideo } from 'persistance/models';

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

export interface ICreateBusinessVideoOptions {
  size: number;
  title: string;
  description?: string;
  businessId: string;
  userId: string;
}

export type ICreateBusinessVideoResult = ICreateBusinessVideoError | ICreateBusinessVideoSuccess;
interface ICreateBusinessVideoSuccess {
  status: 200;
  data: {
    uploadLink: string;
    video: IVideo;
  };
}
interface ICreateBusinessVideoError {
  status: 403 | 404 | 406 | 500;
  error: {
    message: string;
    code: string;
  };
}

export interface IUpdateBusinessVideoOptions {
  videoId: string;
  status?: 'uploaded';
  title?: string;
  description?: string;
  businessId: string;
  userId: string;
}
export type IUpdateBusinessVideoResult = IUpdateBusinessVideoError | IUpdateBusinessVideoSuccess;
interface IUpdateBusinessVideoSuccess {
  status: 200;
}
interface IUpdateBusinessVideoError {
  status: 403 | 404 | 406 | 500;
  error: {
    message: string;
    code: string;
  };
}
export type IDeleteBusinessVideoResult = IDeleteBusinessVideoError | IDeleteBusinessVideoSuccess;
interface IDeleteBusinessVideoSuccess {
  status: 204;
}
interface IDeleteBusinessVideoError {
  status: 403 | 404 | 406 | 500;
  error: {
    message: string;
    code: string;
  };
}

export interface ICreateBusinessVideoBody {
  title: string;
  description: string;
  size: number;
}
export interface IUpdateBusinessVideoBody {
  title?: string;
  description?: string;
  status?: 'uploaded';
}

export interface IDeleteVideoParams {
  businessId: string;
  videoId: string;
}
