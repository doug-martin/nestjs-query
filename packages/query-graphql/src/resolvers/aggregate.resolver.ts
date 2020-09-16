import { AggregateQuery, AggregateResponse, Class, mergeFilter, QueryService } from '@nestjs-query/core';
import { Args, ArgsType, Resolver, Context } from '@nestjs/graphql';
import omit from 'lodash.omit';
import { getDTONames } from '../common';
import { AggregateQueryParam, ResolverMethodOpts, ResolverQuery, SkipIf } from '../decorators';
import { AggregateArgsType, AggregateResponseType } from '../types';
import { getAuthFilter, transformAndValidate } from './helpers';
import { BaseServiceResolver, ResolverClass, ServiceResolver } from './resolver.interface';

export type AggregateResolverOpts = {
  enabled?: boolean;
} & ResolverMethodOpts;

export interface AggregateResolver<DTO, QS extends QueryService<DTO, unknown, unknown>>
  extends ServiceResolver<DTO, QS> {
  aggregate(filter: AggregateArgsType<DTO>, aggregateQuery: AggregateQuery<DTO>): Promise<AggregateResponse<DTO>>;
}

/**
 * @internal
 * Mixin to add `read` graphql endpoints.
 */
export const Aggregateable = <DTO, QS extends QueryService<DTO, unknown, unknown>>(
  DTOClass: Class<DTO>,
  opts?: AggregateResolverOpts,
) => <B extends Class<ServiceResolver<DTO, QS>>>(BaseClass: B): Class<AggregateResolver<DTO, QS>> & B => {
  const { baseNameLower } = getDTONames(DTOClass);
  const commonResolverOpts = omit(opts, 'dtoName', 'one', 'many', 'QueryArgs', 'Connection');
  const queryName = `${baseNameLower}Aggregate`;
  const AR = AggregateResponseType(DTOClass);
  @ArgsType()
  class AA extends AggregateArgsType(DTOClass) {}

  @Resolver(() => AR, { isAbstract: true })
  class AggregateResolverBase extends BaseClass {
    @SkipIf(() => !opts || !opts.enabled, ResolverQuery(() => AR, { name: queryName }, commonResolverOpts, opts ?? {}))
    async aggregate(
      @Args() args: AA,
      @AggregateQueryParam() query: AggregateQuery<DTO>,
      @Context() context?: unknown,
    ): Promise<AggregateResponse<DTO>> {
      const qa = await transformAndValidate(AA, args);
      const authorizeFilter = await getAuthFilter(this.authorizer, context);
      return this.service.aggregate(mergeFilter(qa.filter || {}, authorizeFilter ?? {}), query);
    }
  }
  return AggregateResolverBase;
};

export const AggregateResolver = <
  DTO,
  QS extends QueryService<DTO, unknown, unknown> = QueryService<DTO, unknown, unknown>
>(
  DTOClass: Class<DTO>,
  opts?: AggregateResolverOpts,
): ResolverClass<DTO, QS, AggregateResolver<DTO, QS>> => Aggregateable(DTOClass, opts)(BaseServiceResolver);
