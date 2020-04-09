import { IBusiness } from 'persistance/models';

export interface IDataImportBody {
  type: 'csv' | 'json';
  businesses: unknown;
}

export interface IDataImportResponse {
  status: number;
  message?: string;
  successful?: IBusiness[];
  failed?: IBusiness[];
}
