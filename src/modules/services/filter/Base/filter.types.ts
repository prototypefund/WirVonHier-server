import { Document, DocumentQuery } from 'mongoose';

export interface IObjectQuery {
  [key: string]: string;
}

export interface IParsedQuery {
  name: string;
  operator: string | null;
  value: string | string[];
}

export type IQueryOperator = 'lte' | 'gte' | 'equals' | 'in' | 'near' | 'regex' | 'geometry';

export interface IQueryData {
  operator: IQueryOperator;
  args: string | string[] | object;
}

export interface IQueryOperation<T extends Document> {
  (query: DocumentQuery<T[], T, {}>): DocumentQuery<T[], T, {}>;
}
