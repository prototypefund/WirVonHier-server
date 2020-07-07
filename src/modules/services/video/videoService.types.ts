import { IVideo } from 'persistance/models';

export type VideoType = 'story';
export interface ICreateVideoOptions {
  title: string;
  description: string;
  uri: string;
  businessId: string;
}

export type ICreateVideoResponse = ICreateVideoError | ICreateVideoSuccess;
interface ICreateVideoSuccess {
  status: 200;
  video: IVideo;
}
interface ICreateVideoError {
  status: 400 | 401 | 403 | 404 | 406 | 500;
  error: {
    message: string;
    code: string;
  };
}

export type IVideoUpdates = {
  [Key in keyof IVideo]?: IVideo[Key];
};

export type IUpdateVideoResponse = IUpdateVideoSuccess | IUpdateVideoError;
interface IUpdateVideoSuccess {
  status: 200;
}
interface IUpdateVideoError {
  status: 404;
  error: { code: string; message: string };
}

export interface IDeleteVideoOptions {
  businessId: string;
  videoId: string;
  userId: string;
}

export type IDeleteVideoResponse = IDeleteVideoSuccess | IDeleteVideoError;
interface IDeleteVideoSuccess {
  status: 204;
}
interface IDeleteVideoError {
  status: 404 | 500;
  error: { code: string; message: string };
}

export interface IVimeoGetVideoResponse {
  uri: string;
  width: number;
  height: number;
  maxContentLength: number;
  files: {
    quality: string;
    type: string;
    width: number;
    height: number;
    link: string;
    created_time: string;
    fps: string;
    size: string;
    md5: string;
  }[];
  status: string;
  upload: {
    status: string;
  };
  transcode: {
    status: string;
  };
}
export interface IVimeoRequestDownloadURLResponse {
  url: string;
  maxContentLength: number;
  files: any[];
}

export interface IVimeoRequestUploadURLResponse {
  uri: string;
  upload: {
    upload_link: string;
  };
}
export interface IRequestUploadURLOptions {
  size: number;
  title: string;
  description: string;
}
