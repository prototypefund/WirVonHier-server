import { DocumentQuery, Document, Model } from 'mongoose';
import { IQueryOperation, IQueryOperator, IParsedQuery, IObjectQuery, IQueryData } from './filter.types';

export class Filter<T extends Document> {
  private FILTER_IDENTIFIER = 'filter_';
  private queryOperations: IQueryOperation<T>[] = [];
  private operatorMap: Map<string, IQueryOperator | IQueryOperator[]> = new Map([
    ['lte', 'lte'],
    ['gte', 'gte'],
    ['equals', 'equals'],
    ['contains', 'regex'],
  ]);
  private operatorParameterNameMap: Map<string, IQueryOperator | IQueryOperator[]> = new Map([['location', 'near']]);

  public isValidQuery(rawQuery: unknown): boolean {
    if (typeof rawQuery === 'object') {
      return !!rawQuery && Object.keys(rawQuery).every((key) => typeof key === 'string');
    }
    return false;
  }

  public addQuery(query: unknown): boolean {
    if (!this.isValidQuery(query)) return false;
    try {
      let parsedQuery!: IParsedQuery[];
      if (typeof query === 'object') {
        parsedQuery = this.parseObjectQuery(query as IObjectQuery);
      }
      const interpretedQuery = parsedQuery.map((raw) => this.interpretParsedQuery(raw));
      const newQueryOperatrions = this.createQueryOperations(interpretedQuery);
      this.queryOperations.push(...newQueryOperatrions);
      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Adding Query failed: ', e);
      return false;
    }
  }

  public execOn(model: Model<T, {}>): Promise<T[]> {
    const documentQuery = model.find();
    const finalQuery = this.queryOperations.reduce((acc, queryOperation) => {
      return queryOperation(acc);
    }, documentQuery);
    return finalQuery.exec();
  }

  public limit(size: string | number): void {
    const number = Number(size);
    if (!number) return;
    this.queryOperations.push((q) => q.limit(number));
  }

  private parseObjectQuery(filterQuery: IObjectQuery): IParsedQuery[] {
    return Object.keys(filterQuery)
      .filter((key) => key.includes(this.FILTER_IDENTIFIER))
      .map((name) => {
        const propertyName = name.split('_')[1];
        const val = filterQuery[name];
        const operator = val.includes(':') ? val.split(':')[0] : null;
        const value = this.parseValue(val.includes(':') ? val.split(':')[1] : val);
        return { name: propertyName, operator, value };
      });
  }

  private parseValue(value: string): string | string[] {
    return value.includes('|') ? value.split('|') : value;
  }

  private interpretParsedQuery(data: IParsedQuery): IQueryData[] {
    const queryOperations = [
      {
        operator: 'where' as IQueryOperator,
        args: data.name,
      },
    ];
    const operators = this.deduceOperators(data);
    const args = this.deduceArgs(operators, data);

    const ops: IQueryData[] = operators
      .filter((_, i) => args[i] !== null)
      .map((o, i) => {
        return {
          operator: o,
          args: args[i] as (string | object)[],
        };
      });
    return ops.length > 0 ? [...queryOperations, ...ops] : [];
  }

  private deduceOperators(data: IParsedQuery): IQueryOperator[] {
    const { operator, name, value } = data;
    if (!name || !value) return [];

    if (value instanceof Array) {
      return ['in'];
    }

    const byOperator = operator && this.operatorMap.get(operator);
    if (byOperator) return this.normalizeValue(byOperator);

    const byParameter = this.operatorParameterNameMap.get(name);
    if (byParameter) return this.normalizeValue(byParameter);

    return [];
  }

  private normalizeValue<V>(value: V | V[]): V[] {
    return value instanceof Array ? value : [value];
  }

  private deduceArgs(operators: string[], data: IParsedQuery): (string | object | null)[] {
    const { value } = data;
    return operators.map((o) => {
      switch (o) {
        case 'near': {
          const res = this.validateCoordinates(value);
          return res ? { spherical: true, center: res.center, maxDistance: res.maxDistance } : null;
        }
        default:
          return value;
      }
    });
  }

  // coordinates need to be: [ lng, lat ]
  private validateCoordinates(value: string | string[]): { center: object; maxDistance: number } | null {
    if (value instanceof Array) return null;
    const [lng, lat, maxDistance] = value.split(',');
    const LNG = parseFloat(lng);
    const LAT = parseFloat(lat);
    const MAXDISTANCE = parseFloat(maxDistance);
    if (!LNG || !LAT || (!MAXDISTANCE && MAXDISTANCE !== 0)) return null;
    const center = {
      type: 'Point',
      coordinates: [LNG, LAT],
    };
    return { center, maxDistance: MAXDISTANCE };
  }

  private createQueryOperations(interpretedQuery: IQueryData[][]): IQueryOperation<T>[] {
    return interpretedQuery.reduce((acc: IQueryOperation<T>[], data) => {
      return [
        ...acc,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...data.map((filter) => (query: any): DocumentQuery<T[], T, {}> => {
          return query[filter.operator](filter.args);
        }),
      ];
    }, []);
  }
}
