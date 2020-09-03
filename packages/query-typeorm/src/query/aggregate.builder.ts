import { SelectQueryBuilder } from 'typeorm';
import { AggregateQuery, AggregateResponse } from '@nestjs-query/core';
import { BadRequestException } from '@nestjs/common';

enum AggregateFuncs {
  AVG = 'AVG',
  SUM = 'SUM',
  COUNT = 'COUNT',
  MAX = 'MAX',
  MIN = 'MIN',
}

const AGG_REGEXP = /(AVG|SUM|COUNT|MAX|MIN)_(.*)/;

/**
 * @internal
 * Builds a WHERE clause from a Filter.
 */
export class AggregateBuilder<Entity> {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  static async asyncConvertToAggregateResponse<Entity>(
    responsePromise: Promise<Record<string, unknown>>,
  ): Promise<AggregateResponse<Entity>> {
    const aggResponse = await responsePromise;
    return this.convertToAggregateResponse(aggResponse);
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  static getAggregateAliases<Entity>(query: AggregateQuery<Entity>): string[] {
    const aggs: [AggregateFuncs, (keyof Entity)[] | undefined][] = [
      [AggregateFuncs.COUNT, query.count],
      [AggregateFuncs.SUM, query.sum],
      [AggregateFuncs.AVG, query.avg],
      [AggregateFuncs.MAX, query.max],
      [AggregateFuncs.MIN, query.min],
    ];
    return aggs.reduce((cols, [func, fields]) => {
      const aliases = (fields ?? []).map((f) => this.getAggregateAlias(func, f));
      return [...cols, ...aliases];
    }, [] as string[]);
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  static getAggregateAlias<Entity>(func: AggregateFuncs, field: keyof Entity): string {
    return `${func}_${field as string}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  static convertToAggregateResponse<Entity>(response: Record<string, unknown>): AggregateResponse<Entity> {
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
   * @param qb - the `typeorm` SelectQueryBuilder
   * @param aggregate - the aggregates to select.
   * @param alias - optional alias to use to qualify an identifier
   */
  build<Qb extends SelectQueryBuilder<Entity>>(qb: Qb, aggregate: AggregateQuery<Entity>, alias?: string): Qb {
    const selects = [
      ...this.createAggSelect(AggregateFuncs.COUNT, aggregate.count, alias),
      ...this.createAggSelect(AggregateFuncs.SUM, aggregate.sum, alias),
      ...this.createAggSelect(AggregateFuncs.AVG, aggregate.avg, alias),
      ...this.createAggSelect(AggregateFuncs.MAX, aggregate.max, alias),
      ...this.createAggSelect(AggregateFuncs.MIN, aggregate.min, alias),
    ];
    if (!selects.length) {
      throw new BadRequestException('No aggregate fields found.');
    }
    const [head, ...tail] = selects;
    return tail.reduce((acc: Qb, [select, selectAlias]) => {
      return acc.addSelect(select, selectAlias);
    }, qb.select(head[0], head[1]));
  }

  private createAggSelect(func: AggregateFuncs, fields?: (keyof Entity)[], alias?: string): [string, string][] {
    if (!fields) {
      return [];
    }
    return fields.map((field) => {
      const col = alias ? `${alias}.${field as string}` : (field as string);
      return [`${func}(${col})`, AggregateBuilder.getAggregateAlias(func, field)];
    });
  }
}
