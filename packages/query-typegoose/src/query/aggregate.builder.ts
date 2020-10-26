import { AggregateQuery, AggregateResponse } from '@nestjs-query/core';
import { BadRequestException } from '@nestjs/common';
import { getSchemaKey } from './helpers';
import { DocumentType } from '@typegoose/typegoose';

enum AggregateFuncs {
  AVG = 'avg',
  SUM = 'sum',
  COUNT = 'count',
  MAX = 'max',
  MIN = 'min',
}

export type TypegooseAggregate = {
  [k: string]: {
    [o: string]: unknown;
  };
};

const AGG_REGEXP = /(avg|sum|count|max|min)_(.*)/;

/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
export class AggregateBuilder<Entity> {
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

  /**
   * Builds a aggregate SELECT clause from a aggregate.
   * @param aggregate - the aggregates to select.
   */
  build(aggregate: AggregateQuery<DocumentType<Entity>>): TypegooseAggregate {
    const query = {
      ...this.createAggSelect(AggregateFuncs.COUNT, aggregate.count),
      ...this.createAggSelect(AggregateFuncs.SUM, aggregate.sum),
      ...this.createAggSelect(AggregateFuncs.AVG, aggregate.avg),
      ...this.createAggSelect(AggregateFuncs.MAX, aggregate.max),
      ...this.createAggSelect(AggregateFuncs.MIN, aggregate.min),
    };
    if (!Object.keys(query).length) {
      throw new BadRequestException('No aggregate fields found.');
    }
    return query;
  }

  private createAggSelect(func: AggregateFuncs, fields?: (keyof DocumentType<Entity>)[]): TypegooseAggregate {
    if (!fields) {
      return {};
    }
    return fields.reduce((agg: TypegooseAggregate, field) => {
      const aggAlias = `${func}_${field as string}`;
      const fieldAlias = `$${getSchemaKey(String(field))}`;
      if (func === 'count') {
        return {
          ...agg,
          [aggAlias]: {
            $sum: {
              $cond: {
                if: { $in: [{ $type: fieldAlias }, ['missing', 'null']] },
                then: 0,
                else: 1,
              },
            },
          },
        };
      }
      return { ...agg, [aggAlias]: { [`$${func}`]: fieldAlias } };
    }, {});
  }
}
