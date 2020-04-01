import { Document, DocumentQuery } from 'mongoose';

export interface IQueryDefinition {
  propertyName: string;
  operator: string;
  value: string;
}

export interface IQuery<T extends Document> {
  // tslint:disable-next-line callable-types (This is extended from and can't extend from a type alias in ts<2.2
  (query: DocumentQuery<T[], T, {}>): DocumentQuery<T[], T, {}>;
}
