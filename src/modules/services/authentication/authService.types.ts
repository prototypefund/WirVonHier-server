export interface IAuthResponse {
  token?: string;
  error?: {
    status: number;
    message: string;
  };
}
