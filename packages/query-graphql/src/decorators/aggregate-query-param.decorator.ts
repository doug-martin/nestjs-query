import { AggregateQuery } from '@nestjs-query/core';
import { GraphQLResolveInfo } from 'graphql';
import { GqlExecutionContext } from '@nestjs/graphql';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import graphqlFields from 'graphql-fields';

const EXCLUDED_FIELDS = ['__typename'];
const QUERY_OPERATORS: (keyof AggregateQuery<unknown>)[] = ['groupBy', 'count', 'avg', 'sum', 'min', 'max'];
export const AggregateQueryParam = createParamDecorator(<DTO>(data: unknown, ctx: ExecutionContext) => {
  const info = GqlExecutionContext.create(ctx).getInfo<GraphQLResolveInfo>();
  const fields = graphqlFields(info, {}, { excludedFields: EXCLUDED_FIELDS }) as Record<
    keyof AggregateQuery<DTO>,
    Record<keyof DTO, unknown>
  >;
  return QUERY_OPERATORS.filter((operator) => !!fields[operator]).reduce((query, operator) => {
    const queryFields = Object.keys(fields[operator]) as (keyof DTO)[];
    if (queryFields && queryFields.length) {
      return { ...query, [operator]: queryFields };
    }
    return query;
  }, {} as AggregateQuery<DTO>);
});
