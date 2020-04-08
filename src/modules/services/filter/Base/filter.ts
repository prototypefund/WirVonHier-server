import { DocumentQuery, Document, Model } from 'mongoose';
import { IQueryOperation, IQueryOperator, IParsedQuery, IObjectQuery, IQueryData } from './filter.types';
import zipCodesGermany from './zipCodes/germany.json';

const convertedZipCodes: Iterable<readonly [string, number[]]> = zipCodesGermany.map((loc) => {
  const [lat, lng] = loc['Geo Point'].split(' ').join('').split(',');
  return [loc['Postleitzahl'], [parseFloat(lng), parseFloat(lat)]];
});

export class Filter<T extends Document> {
  private FILTER_IDENTIFIER = 'filter_';
  private queryOperations: IQueryOperation<T>[] = [];
  private zipCodes: Map<string, number[]> = new Map(convertedZipCodes);
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

  public addQuery(query: unknown): { status?: string; error?: Error } {
    if (!this.isValidQuery(query)) return { error: new Error('Invalid Query String.') };
    try {
      let parsedQuery!: IParsedQuery[];
      if (typeof query === 'object') {
        parsedQuery = this.parseObjectQuery(query as IObjectQuery);
      }
      const interpretedQuery = parsedQuery.map((raw) => this.interpretParsedQuery(raw));
      const newQueryOperatrions = this.createQueryOperations(interpretedQuery);
      this.queryOperations.push(...newQueryOperatrions);
      return { status: 'success' };
    } catch (e) {
      return { error: e };
    }
  }

  public getQuery(model: Model<T, {}>): DocumentQuery<T[], T, {}> {
    const documentQuery = model.find();
    const finalQuery = this.queryOperations.reduce((acc, queryOperation) => {
      return queryOperation(acc);
    }, documentQuery);
    return finalQuery;
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

    const ops: IQueryData[] = operators.map((o, i) => {
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

    return ['equals'];
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
        case 'regex': {
          return new RegExp(`${value}`, 'i');
        }
        default:
          return value;
      }
    });
  }

  // coordinates need to be: [ lng, lat ]
  private validateCoordinates(value: string | string[]): { center: object; maxDistance: number } | null {
    if (value instanceof Array) return null;
    const params = value.split(',');
    let LNG: number | undefined = 0;
    let LAT: number | undefined = 0;
    let MAXDISTANCE = 0;
    if (params.length === 2) {
      const zip = params[0];
      const entry = this.zipCodes.get(zip);
      if (!entry) throw new Error(`ZIP-Code ${zip} does not exist.`);
      LNG = entry[0];
      LAT = entry[1];
      MAXDISTANCE = Number(params[1]);
    } else {
      LNG = Number(params[0]);
      LAT = Number(params[1]);
      MAXDISTANCE = Number(params[2]);
    }
    if (LNG !== 0 && !LNG)
      throw new Error(
        `Invalid value passed as longitude (first parameter) to "location" filter: "${params[0]}". Must be number between -180 and 180.`,
      );
    if (LAT !== 0 && !LAT)
      throw new Error(
        `Invalid value passed as latitude (second parameter) to "location" filter: "${params[1]}". Must be number between -180 and 180.`,
      );
    if (!MAXDISTANCE && MAXDISTANCE !== 0)
      throw new Error(
        `Invalid value passed as maxDistance to "location" filter: "${params[2]}". Must be number (in meters)`,
      );
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
