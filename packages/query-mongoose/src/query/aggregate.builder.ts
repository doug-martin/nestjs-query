import { AggregateQuery, AggregateResponse } from '@nestjs-query/core';
import { BadRequestException } from '@nestjs/common';
import { Document } from 'mongoose';
import { camelCase } from 'camel-case';
import { getSchemaKey } from './helpers';

enum AggregateFuncs {
  AVG = 'avg',
  SUM = 'sum',
  COUNT = 'count',
  MAX = 'max',
  MIN = 'min',
}
type Aggregate = Record<string, Record<string, unknown>>;
type Group = { _id: Record<string, string> | null };
export type MongooseGroupAndAggregate = Aggregate & Group;

const AGG_REGEXP = /(avg|sum|count|max|min|group_by)_(.*)/;

/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
export class AggregateBuilder<Entity extends Document> {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  static convertToAggregateResponse<Entity>(aggregates: Record<string, unknown>[]): AggregateResponse<Entity>[] {
    return aggregates.map(({ _id, ...response }) => {
      return { ...this.extractResponse(_id as Record<string, unknown>), ...this.extractResponse(response) };
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  private static extractResponse<Entity>(response?: Record<string, unknown>): AggregateResponse<Entity> {
    if (!response) {
      return {};
    }
    return Object.keys(response).reduce((agg, resultField: string) => {
      const matchResult = AGG_REGEXP.exec(resultField);
      if (!matchResult) {
        throw new Error('Unknown aggregate column encountered.');
      }
      const [matchedFunc, matchedFieldName] = matchResult.slice(1);
      const aggFunc = camelCase(matchedFunc.toLowerCase()) as keyof AggregateResponse<Entity>;
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
  build(aggregate: AggregateQuery<Entity>): MongooseGroupAndAggregate {
    const aggSelect: Aggregate = {
      ...this.createAggSelect(AggregateFuncs.COUNT, aggregate.count),
      ...this.createAggSelect(AggregateFuncs.SUM, aggregate.sum),
      ...this.createAggSelect(AggregateFuncs.AVG, aggregate.avg),
      ...this.createAggSelect(AggregateFuncs.MAX, aggregate.max),
      ...this.createAggSelect(AggregateFuncs.MIN, aggregate.min),
    };
    if (!Object.keys(aggSelect).length) {
      throw new BadRequestException('No aggregate fields found.');
    }
    return { ...aggSelect, _id: this.createGroupBySelect(aggregate.groupBy) } as MongooseGroupAndAggregate;
  }

  private createAggSelect(func: AggregateFuncs, fields?: (keyof Entity)[]): Aggregate {
    if (!fields) {
      return {};
    }
    return fields.reduce((agg: Aggregate, field) => {
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

  private createGroupBySelect(fields?: (keyof Entity)[]): Record<string, string> | null {
    if (!fields) {
      return null;
    }
    return fields.reduce((id: Record<string, string>, field) => {
      const aggAlias = this.getGroupByAlias(field);
      const fieldAlias = `$${getSchemaKey(String(field))}`;
      return { ...id, [aggAlias]: fieldAlias };
    }, {});
  }

  getGroupBySelects(fields?: (keyof Entity)[]): string[] | undefined {
    if (!fields) {
      return undefined;
    }
    // append _id so it pulls the sort from the _id field
    return (fields ?? []).map((f) => `_id.${this.getGroupByAlias(f)}`);
  }

  private getGroupByAlias(field: keyof Entity): string {
    return `group_by_${field as string}`;
  }
}
