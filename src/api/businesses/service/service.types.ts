import { IBusiness } from 'persistance/models';

export interface IFilteredBusinesses {
  total: number;
  page: number;
  lastPage: number;
  perPage: number;
  businesses: IBusiness[];
  error?: Error;
}
