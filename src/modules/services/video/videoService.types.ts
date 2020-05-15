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
