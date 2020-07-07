export type IServiceResponse = IServiceError;

interface IServiceError {
  status: 400 | 401 | 403 | 404 | 406 | 500;
  error: {
    message: string;
    code: string;
  };
}
