import { Document } from 'mongoose';

export interface IObjectQuery {
  [key: string]: string;
}

export enum SortingDirection {
  ASC = 1,
  DESC = -1,
}

export interface IParsedFilter {
  name: string;
  givenOperator: string | null;
  value: string | string[];
}
export interface IParsedSorting {
  [name: string]: SortingDirection;
}

export interface IFilterQueryDefinition {
  location: { coords: number[]; maxDistance: number };
  filters: IParsedFilter[];
  limit: number;
  page: number;
  sorting: IParsedSorting;
}

export interface IFilterDef {
  name: 'string';
  operator: IQueryOperator;
  value: string | number | string[] | number[];
}

export type IQueryOperator = 'lte' | 'gte' | 'equals' | 'in' | 'near' | 'regex' | 'geometry';

export interface IFilterResult {
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  list: Document[];
}

export interface ILocationWithDistance {
  distance: number;
  _id: string;
  geo: { type: 'Point'; coordinates: number[] };
  createdAt: string;
  modifiedAt: string;
}
