export type VideoType = 'cover' | 'profile' | 'story' | 'logo';
export interface ICreateVideoOptions {
  title: string;
  description: string;
  size: number;
  businessId: string;
  userId: string;
}
export interface IDeleteVideoOptions {
  businessId: string;
  videoId: string;
  userId: string;
}

export interface IVimeoCreateVideoResponse {
  uri: string;
  upload: {
    upload_link: string;
  };
}
export interface IVimeoDeleteVideoResponse {
  uri: string;
  upload: {
    upload_link: string;
  };
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
export interface IGetVideoUrlResponse {
  url: string;
}
