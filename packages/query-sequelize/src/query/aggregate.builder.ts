import sequelize, { Projectable } from 'sequelize';
import { AggregateQuery, AggregateResponse } from '@nestjs-query/core';
import { Model, ModelCtor } from 'sequelize-typescript';
import { BadRequestException } from '@nestjs/common';
import { camelCase } from 'camel-case';

enum AggregateFuncs {
  AVG = 'AVG',
  SUM = 'SUM',
  COUNT = 'COUNT',
  MAX = 'MAX',
  MIN = 'MIN',
}

const AGG_REGEXP = /(AVG|SUM|COUNT|MAX|MIN|GROUP_BY)_(.*)/;

/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
export class AggregateBuilder<Entity extends Model<Entity, Partial<Entity>>> {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  static convertToAggregateResponse<Entity>(rawAggregates: Record<string, unknown>[]): AggregateResponse<Entity>[] {
    return rawAggregates.map((aggregate) => {
      return Object.keys(aggregate).reduce((agg, resultField: string) => {
        const matchResult = AGG_REGEXP.exec(resultField);
        if (!matchResult) {
          throw new Error('Unknown aggregate column encountered.');
        }
        const [matchedFunc, matchedFieldName] = matchResult.slice(1);
        const aggResponseKey = camelCase(matchedFunc.toLowerCase()) as keyof AggregateResponse<Entity>;
        const fieldName = matchedFieldName as keyof Entity;
        const aggResult = agg[aggResponseKey] || {};
        return {
          ...agg,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          [aggResponseKey]: { ...aggResult, [fieldName]: aggregate[resultField] },
        };
      }, {} as AggregateResponse<Entity>);
    });
  }

  constructor(readonly model: ModelCtor<Entity>) {}

  /**
   * Builds a aggregate SELECT clause from a aggregate.
   * @param aggregate - the aggregates to select.
   */
  build(aggregate: AggregateQuery<Entity>): Projectable {
    const selects = [
      ...this.createGroupBySelect(aggregate.groupBy),
      ...this.createAggSelect(AggregateFuncs.COUNT, aggregate.count),
      ...this.createAggSelect(AggregateFuncs.SUM, aggregate.sum),
      ...this.createAggSelect(AggregateFuncs.AVG, aggregate.avg),
      ...this.createAggSelect(AggregateFuncs.MAX, aggregate.max),
      ...this.createAggSelect(AggregateFuncs.MIN, aggregate.min),
    ];
    if (!selects.length) {
      throw new BadRequestException('No aggregate fields found.');
    }
    return {
      attributes: selects,
    };
  }

  private createAggSelect(func: AggregateFuncs, fields?: (keyof Entity)[]): [sequelize.Utils.Fn, string][] {
    if (!fields) {
      return [];
    }
    return fields.map((field) => {
      const aggAlias = `${func}_${field as string}`;
      const colName = this.model.rawAttributes[field as string].field;
      const fn = sequelize.fn(func, sequelize.col(colName || (field as string)));
      return [fn, aggAlias];
    });
  }

  private createGroupBySelect(fields?: (keyof Entity)[]): [sequelize.Utils.Col, string][] {
    if (!fields) {
      return [];
    }
    return fields.map((field) => {
      const colName = this.model.rawAttributes[field as string].field;
      return [sequelize.col(colName || (field as string)), `GROUP_BY_${field as string}`];
    });
  }
}
