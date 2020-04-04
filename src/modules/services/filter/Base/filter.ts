import { DocumentQuery, Document } from 'mongoose';

// TODO: write all valid QueryOperators down
// TODO: write operatorMap (explicit operator mapping from query parameter)
// TODO: write operatorParameterNameMap (mapping from parameterName to operators)

export type IQueryOperator = 'where' | 'lte' | 'gte' | 'equals' | 'circle';

export interface IRawFilterData {
  name: string;
  operator: string | null;
  value: string | string[];
}
export interface IFilterData {
  operator: IQueryOperator;
  args: string | string[];
}

export interface IFilter<T extends Document> {
  (query: DocumentQuery<T[], T, {}>): DocumentQuery<T[], T, {}>;
}

export class Filter<T extends Document> {
  private query: DocumentQuery<T[], T, {}>;
  private rawFilterData: IRawFilterData[] = [];
  private filterData: IFilterData[][] = [];
  private filters: Array<IFilter<T>> = [];
  private operatorMap: Map<string, IQueryOperator | IQueryOperator[]> = new Map();
  private operatorParameterNameMap: Map<string, IQueryOperator | IQueryOperator[]> = new Map();

  constructor(query: DocumentQuery<T[], T, {}>) {
    this.query = query;
  }

  public parseQueryString(filterQuery: { [key: string]: string }): void {
    this.rawFilterData = Object.keys(filterQuery).map((name) => {
      const val = filterQuery[name];
      const operator = val.includes(':') ? val[0] : null;
      const value = this.parseValue(val.includes(':') ? val[1] : val);
      return { name, operator, value };
    });
    this.generateFilterData();
    this.createFilters();
  }

  public applyFilter(): DocumentQuery<T[], T, {}> {
    return this.filters.reduce((acc, filter) => filter(acc), this.query);
  }

  private generateFilterData(): void {
    this.filterData = this.rawFilterData.map((raw) => this.interpretRawFilterData(raw));
  }

  private interpretRawFilterData(data: IRawFilterData): IFilterData[] {
    const operators = this.deduceOperators(data);
    const args = this.deduceArgs(operators, data);

    return operators.map((o, i) => {
      return {
        operator: o,
        args: args[i],
      };
    });
  }

  private deduceOperators(data: IRawFilterData): IQueryOperator[] {
    const { operator, name, value } = data;
    if (!name || !value) return [];
    if (operator) {
      const op = this.operatorMap.get(operator);
      if (!op) return [];
      return op instanceof Array ? op : [op];
    }
    if (value instanceof Array) {
      return [];
    }
    const op = this.operatorParameterNameMap.get(name);
    if (!op) return [];
    return op instanceof Array ? op : [op];
  }

  private deduceArgs(operators: string[], data: IRawFilterData): (string | string[])[] {
    const { name, value } = data;
    if (name === 'location') {
      return ['location', 'area'];
    }
    return operators.map((o) => {
      switch (o) {
        case 'where':
          return name;
        case 'circle':
          return 'create area objecct';
        default:
          // 'equal'
          return value;
      }
    });
  }

  private createFilters(): void {
    this.filters = this.filterData.reduce((acc: IFilter<T>[], data) => {
      return [
        ...acc,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...data.map((filter) => (query: any): DocumentQuery<T[], T, {}> => query[filter.operator](...filter.args)),
      ];
    }, []);
  }

  private parseValue(value: string): string | string[] {
    return value.includes('|') ? value.split('|') : value;
  }
}
