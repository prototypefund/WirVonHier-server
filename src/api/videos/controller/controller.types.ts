export interface ICreateVideoBody {
  title: string;
  description: string;
  size: number;
}

export interface IDeleteVideoParams {
  businessId: string;
  videoId: string;
}
