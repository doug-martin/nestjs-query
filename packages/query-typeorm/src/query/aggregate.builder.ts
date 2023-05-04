import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { AggregateQuery, AggregateResponse } from '@codeshine/nestjs-query-core';
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
export class AggregateBuilder<Entity extends ObjectLiteral> {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  static async asyncConvertToAggregateResponse<Entity>(
    responsePromise: Promise<Record<string, unknown>[]>,
  ): Promise<AggregateResponse<Entity>[]> {
    const aggResponse = await responsePromise;
    return this.convertToAggregateResponse(aggResponse);
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  static getAggregateSelects<Entity>(query: AggregateQuery<Entity>): string[] {
    return [...this.getAggregateGroupBySelects(query), ...this.getAggregateFuncSelects(query)];
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  private static getAggregateGroupBySelects<Entity>(query: AggregateQuery<Entity>): string[] {
    return (query.groupBy ?? []).map((f) => this.getGroupByAlias(f));
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  private static getAggregateFuncSelects<Entity>(query: AggregateQuery<Entity>): string[] {
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
  static getGroupByAlias<Entity>(field: keyof Entity): string {
    return `GROUP_BY_${field as string}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-shadow
  static convertToAggregateResponse<Entity>(rawAggregates: Record<string, unknown>[]): AggregateResponse<Entity>[] {
    return rawAggregates.map((response) => {
      return Object.keys(response).reduce((agg: AggregateResponse<Entity>, resultField: string) => {
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
      }, {});
    });
  }

  /**
   * Builds a aggregate SELECT clause from a aggregate.
   * @param qb - the `typeorm` SelectQueryBuilder
   * @param aggregate - the aggregates to select.
   * @param alias - optional alias to use to qualify an identifier
   */
  build<Qb extends SelectQueryBuilder<Entity>>(qb: Qb, aggregate: AggregateQuery<Entity>, alias?: string): Qb {
    const selects = [
      ...this.createGroupBySelect(aggregate.groupBy, alias),
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
    return tail.reduce(
      (acc: Qb, [select, selectAlias]) => acc.addSelect(select, selectAlias),
      qb.select(head[0], head[1]),
    );
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

  private createGroupBySelect(fields?: (keyof Entity)[], alias?: string): [string, string][] {
    if (!fields) {
      return [];
    }
    return fields.map((field) => {
      const col = alias ? `${alias}.${field as string}` : (field as string);
      return [`${col}`, AggregateBuilder.getGroupByAlias(field)];
    });
  }
}
