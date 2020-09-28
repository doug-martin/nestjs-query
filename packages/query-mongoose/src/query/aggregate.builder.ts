import { AggregateQuery, AggregateResponse } from '@nestjs-query/core';
import { Document } from 'mongoose';
import { getSchemaKey } from './helpers';

enum AggregateFuncs {
  AVG = 'avg',
  SUM = 'sum',
  COUNT = 'count',
  MAX = 'max',
  MIN = 'min',
}

export type MongooseAggregate = {
  [k: string]: {
    [o: string]: unknown;
  };
};

const AGG_REGEXP = /(avg|sum|count|max|min)_(.*)/;

/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
export class AggregateBuilder<Entity extends Document> {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  static convertToAggregateResponse<Entity>({ _id, ...response }: Record<string, unknown>): AggregateResponse<Entity> {
    return Object.keys(response).reduce((agg, resultField: string) => {
      const matchResult = AGG_REGEXP.exec(resultField);
      if (!matchResult) {
        throw new Error('Unknown aggregate column encountered.');
      }
      const [matchedFunc, matchedFieldName] = matchResult.slice(1);
      const aggFunc = matchedFunc.toLowerCase() as keyof AggregateResponse<Entity>;
      const fieldName = matchedFieldName as keyof Entity;
      const aggResult = agg[aggFunc] || {};
      return {
        ...agg,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [aggFunc]: { ...aggResult, [fieldName]: response[resultField] },
      };
    }, {} as AggregateResponse<Entity>);
  }

  constructor() {}

  /**
   * Builds a aggregate SELECT clause from a aggregate.
   * @param aggregate - the aggregates to select.
   */
  build(aggregate: AggregateQuery<Entity>): MongooseAggregate {
    return {
      ...this.createAggSelect(AggregateFuncs.COUNT, aggregate.count),
      ...this.createAggSelect(AggregateFuncs.SUM, aggregate.sum),
      ...this.createAggSelect(AggregateFuncs.AVG, aggregate.avg),
      ...this.createAggSelect(AggregateFuncs.MAX, aggregate.max),
      ...this.createAggSelect(AggregateFuncs.MIN, aggregate.min),
    };
  }

  private createAggSelect(func: AggregateFuncs, fields?: (keyof Entity)[]): MongooseAggregate {
    if (!fields) {
      return {};
    }
    return fields.reduce((agg: MongooseAggregate, field) => {
      const aggAlias = `${func}_${field as string}`;
      const fieldAlias = `$${getSchemaKey(String(field))}`;
      if (func === 'count') {
        return {
          ...agg,
          [aggAlias]: {
            $sum: {
              $cond: {
                if: { $ne: [fieldAlias, null] },
                then: 1,
                else: 0,
              },
            },
          },
        };
      }
      return { ...agg, [aggAlias]: { [`$${func}`]: fieldAlias } };
    }, {});
  }
}
