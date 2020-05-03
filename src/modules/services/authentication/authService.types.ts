import { DataProtLanguageId } from 'persistance/models';

export interface IAuthResponse {
  token: string;
  refreshToken: string;
  publicRefreshToken: string;
}

export interface IAuthErrorResponse {
  error: {
    status: number;
    message: string;
  };
}

export interface ILocalRegisterBody {
  email: string;
  password: string;
  dataProtStatement: string;
  dataProtStatementLang: DataProtLanguageId;
}
