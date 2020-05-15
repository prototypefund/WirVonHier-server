export type IServiceResponse<T> = IServiceError | IServiceSuccess<T>;

interface IServiceError {
  status: 400 | 401 | 403 | 404 | 406 | 500;
  error: {
    message: string;
    code: string;
  };
}

interface IServiceSuccess<T> {
  status: 200 | 204;
  data: T;
}
