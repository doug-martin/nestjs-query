import { AggregateQuery, AggregateResponse, Class, Filter, mergeFilter, QueryService } from '@nestjs-query/core';
import { Args, ArgsType, Resolver } from '@nestjs/graphql';
import omit from 'lodash.omit';
import { AuthorizerInterceptor } from '../interceptors';
import { getDTONames } from '../common';
import { AggregateQueryParam, AuthorizerFilter, ResolverMethodOpts, ResolverQuery, SkipIf } from '../decorators';
import { AggregateArgsType, AggregateResponseType } from '../types';
import { transformAndValidate } from './helpers';
import { BaseServiceResolver, ResolverClass, ServiceResolver } from './resolver.interface';
import { OperationGroup } from '../auth';

export type AggregateResolverOpts = {
  enabled?: boolean;
} & ResolverMethodOpts;

export interface AggregateResolver<DTO, QS extends QueryService<DTO, unknown, unknown>>
  extends ServiceResolver<DTO, QS> {
  aggregate(
    filter: AggregateArgsType<DTO>,
    aggregateQuery: AggregateQuery<DTO>,
    authFilter?: Filter<DTO>,
  ): Promise<AggregateResponse<DTO>[]>;
}

/**
 * @internal
 * Mixin to add `read` graphql endpoints.
 */
export const Aggregateable =
  <DTO, QS extends QueryService<DTO, unknown, unknown>>(DTOClass: Class<DTO>, opts?: AggregateResolverOpts) =>
  <B extends Class<ServiceResolver<DTO, QS>>>(BaseClass: B): Class<AggregateResolver<DTO, QS>> & B => {
    const { baseNameLower } = getDTONames(DTOClass);
    const commonResolverOpts = omit(opts, 'dtoName', 'one', 'many', 'QueryArgs', 'Connection');
    const queryName = `${baseNameLower}Aggregate`;
    const AR = AggregateResponseType(DTOClass);
    @ArgsType()
    class AA extends AggregateArgsType(DTOClass) {}

    @Resolver(() => AR, { isAbstract: true })
    class AggregateResolverBase extends BaseClass {
      @SkipIf(
        () => !opts || !opts.enabled,
        ResolverQuery(
          () => [AR],
          { name: queryName },
          commonResolverOpts,
          { interceptors: [AuthorizerInterceptor(DTOClass)] },
          opts ?? {},
        ),
      )
      async aggregate(
        @Args() args: AA,
        @AggregateQueryParam() query: AggregateQuery<DTO>,
        @AuthorizerFilter({
          operationGroup: OperationGroup.AGGREGATE,
          many: true,
        })
        authFilter?: Filter<DTO>,
      ): Promise<AggregateResponse<DTO>[]> {
        const qa = await transformAndValidate(AA, args);
        return this.service.aggregate(mergeFilter(qa.filter || {}, authFilter ?? {}), query);
      }
    }
    return AggregateResolverBase;
  };
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export const AggregateResolver = <
  DTO,
  QS extends QueryService<DTO, unknown, unknown> = QueryService<DTO, unknown, unknown>,
>(
  DTOClass: Class<DTO>,
  opts?: AggregateResolverOpts,
): ResolverClass<DTO, QS, AggregateResolver<DTO, QS>> => Aggregateable(DTOClass, opts)(BaseServiceResolver);
