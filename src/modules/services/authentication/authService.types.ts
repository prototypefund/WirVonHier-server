import { DataProtLanguageId } from 'persistance/models';

export interface IAuthResponse {
  token?: string;
  error?: {
    status: number;
    message: string;
  };
}

export interface ILocalRegisterBody {
  email: string;
  password: string;
  dataProtStatement: number;
  dataProtStatementLang: DataProtLanguageId;
}
