import { DocumentQuery, Document, Model, MongooseFilterQuery } from 'mongoose';
import {
  IQueryOperator,
  IFilterQueryDefinition,
  IObjectQuery,
  SortingDirection,
  IParsedFilter,
  IFilterResult,
} from './filter.types';
import zipCodesGermany from './zipCodes/germany.json';

const convertedZipCodes: Iterable<readonly [string, number[]]> = zipCodesGermany.map((loc) => {
  const [lat, lng] = loc['Geo Point'].split(' ').join('').split(',');
  return [loc['Postleitzahl'], [parseFloat(lng), parseFloat(lat)]];
});

export class Filter<T extends Document> {
  public query: IFilterQueryDefinition = {
    location: { coords: [], maxDistance: 5000 },
    filters: [],
    limit: 50,
    page: 0,
    sorting: {},
  };

  private queryNames = {
    FILTER_IDENTIFIER: 'filter_',
    LIMIT: 'limit',
    PAGE: 'page',
    SORT: 'sort',
  };

  private zipCodes: Map<string, number[]> = new Map(convertedZipCodes);
  private operatorMap: Map<string, IQueryOperator> = new Map([
    ['lte', 'lte'],
    ['gte', 'gte'],
    ['equals', 'equals'],
    ['contains', 'regex'],
  ]);

  private operatorParameterNameMap: Map<string, IQueryOperator> = new Map([['location', 'near']]);

  constructor(requestQuery: unknown) {
    this.parseQueryObject(requestQuery);
  }

  public addQuery(query: unknown): void {
    this.parseQueryObject(query);
  }

  public getQuery(model: Model<T, {}>): { query: DocumentQuery<T[], T, {}> } {
    const { query } = this.interpretFilters(model, this.query.filters);
    return { query };
  }

  public async exec(model: Model<T>): Promise<IFilterResult> {
    const { query } = this.interpretFilters(model, this.query.filters);

    const count = await model.countDocuments((query as unknown) as MongooseFilterQuery<T>).exec();
    const list = await query
      .sort(this.query.sorting)
      .skip(this.query.page * this.query.limit)
      .limit(this.query.limit);

    return {
      total: count,
      page: this.query.page,
      perPage: this.query.limit,
      lastPage: Math.ceil(count / this.query.limit),
      list,
    };
  }

  public interpretFilters(model: Model<T>, filters: IParsedFilter[]): { query: DocumentQuery<T[], T, {}> } {
    let query = model.find();
    for (const filter of filters) {
      switch (filter.name) {
        default: {
          const operator = this.getOperator(filter);
          if (!operator) break;
          const value = this.getFilterValue(filter.name, operator, filter.value);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          query = (query.where(filter.name) as any)[operator](value);
        }
      }
    }
    return { query };
  }

  private parseQueryObject(queryObject: unknown): void {
    if (!this.isValidQuery(queryObject)) throw new Error(`Invalid query string.`);
    const query = queryObject as IObjectQuery;
    for (const queryName in query) {
      if (queryName.includes(this.queryNames.FILTER_IDENTIFIER)) {
        this.addFilter(queryName, query[queryName]);
      }

      if (queryName.includes(this.queryNames.LIMIT)) {
        this.addLimit(query[queryName]);
      }

      if (queryName.includes(this.queryNames.PAGE)) {
        this.addPage(query[queryName]);
      }

      if (queryName.includes(this.queryNames.SORT)) {
        this.addSort(queryName, query[queryName]);
      }
    }
  }

  private addFilter(queryName: string, queryValue: string): void {
    const name = queryName.includes('_') ? queryName.split('_')[1] : null;
    if (!name) {
      throw new Error(
        `Invalid query parameter for query "${this.queryNames.FILTER_IDENTIFIER}". Value given: "${queryName}". Value expected: 'filter_{name}'.`,
      );
    }
    const [givenOperator, value] = queryValue.includes(':') ? queryValue.split(':') : [null, queryValue];
    if (name === 'location') {
      this.query.location = this.parseLocation(queryValue);
      return;
    }
    this.query.filters.push({
      name,
      givenOperator,
      value: value.includes('|') ? value.split('|') : value,
    });
  }

  private addLimit(limit: string): void {
    const parsedLimit = parseInt(limit, 10);
    if (typeof parsedLimit !== 'number' || isNaN(parsedLimit)) {
      throw new Error(
        `Invalid query value for query "${this.queryNames.LIMIT}". Value given: "${limit}". Value expected: 'number'.`,
      );
    }
    this.query.limit = parsedLimit;
  }

  private addPage(page: string): void {
    const parsedPage = parseInt(page, 10);
    if (typeof parsedPage !== 'number' || isNaN(parsedPage)) {
      throw new Error(
        `Invalid query value for query "${this.queryNames.PAGE}". Value given: "${page}". Value expected: 'number'.`,
      );
    }
    this.query.page = parsedPage;
  }

  private addSort(parameter: string, value: string): void {
    const direction = value.toLowerCase() === 'asc' ? SortingDirection.ASC : SortingDirection.DESC;
    const name = parameter.includes('_') ? parameter.split('_')[1] : undefined;
    if (!name) {
      throw new Error(
        `Invalid query paramter for query "${this.queryNames.SORT}. Paramter given: "${parameter}". Parameter expected: "sort_{name}".`,
      );
    }
    this.query.sorting[name] = direction;
  }

  private parseLocation(string: string): { coords: number[]; maxDistance: number } {
    if (!string) throw new Error(`Invalid value passed to location filter. Value passed "${location}".`);
    let lng;
    let lat;
    let maxDistance = 2000;
    const args = string.split(',');
    if (args.length === 3) {
      lng = parseFloat(args[0]);
      lat = parseFloat(args[1]);
      maxDistance = parseInt(args[2], 10);
    }
    if (args.length === 2) {
      const coords = this.zipCodes.get(args[0]);
      if (!coords) throw new Error(`Coud not find ZIP-Code passed to location filter. Value passed "${location}".`);
      lng = coords[0];
      lat = coords[1];
      maxDistance = parseInt(args[1], 10);
    }
    if (!lng || !lat || isNaN(lng) || isNaN(lat) || isNaN(maxDistance))
      throw new Error(`Invalid value passed to location filter. Value passed "${location}".`);
    return { coords: [lng, lat], maxDistance };
  }

  private isValidQuery(rawQuery: unknown): boolean {
    if (typeof rawQuery !== 'object') return false; // must be Object
    if (rawQuery === null) return false; // cannot be null
    return true;
  }

  private getOperator(filter: IParsedFilter): IQueryOperator | null {
    const { givenOperator, name, value } = filter;
    if (!name || !value) return null;

    if (value instanceof Array) return 'in';

    if (!givenOperator) {
      const operator = this.operatorParameterNameMap.get(name);
      if (operator) return operator;
    } else {
      const operator = this.operatorMap.get(givenOperator);
      if (operator) return operator;
    }
    return 'equals';
  }

  private getFilterValue(_name: string, operator: string, value: string | string[]): string | string[] | RegExp {
    if (operator === 'regex') return new RegExp(`${value}`, 'i');
    return value;
  }
}
