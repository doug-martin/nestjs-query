import { QueryService } from '@nestjs-query/core';
import { DTONamesOpts } from '../common';
import { QueryResolverMethodOpts, SubscriptionResolverMethodOpts } from '../decorators';
import { GraphQLPubSub } from '../subscription';
import { PagingStrategies, QueryArgsTypeOpts } from '../types';

type NamedEndpoint = {
  /** Specify to override the name of the graphql query or mutation * */
  name?: string;
  /** Specify a description for the graphql query or mutation* */
  description?: string;
};

export interface ResolverOpts extends QueryResolverMethodOpts, DTONamesOpts {
  /**
   * Options for single record graphql endpoints
   */
  one?: QueryResolverMethodOpts & NamedEndpoint;
  /**
   * Options for multiple record graphql endpoints
   */
  many?: QueryResolverMethodOpts & NamedEndpoint;
}

export interface SubscriptionResolverOpts extends SubscriptionResolverMethodOpts, DTONamesOpts {
  one?: SubscriptionResolverMethodOpts & NamedEndpoint;
  many?: SubscriptionResolverMethodOpts & NamedEndpoint;
}

/** @internal */
export interface ServiceResolver<DTO, QS extends QueryService<DTO, unknown, unknown>> {
  service: QS;
  readonly pubSub?: GraphQLPubSub;
}

/** @internal */
export interface ResolverClass<
  DTO,
  QS extends QueryService<DTO, unknown, unknown>,
  Resolver extends ServiceResolver<DTO, QS>,
> {
  new (service: QS): Resolver;
}

/**
 * @internal
 * Base Resolver that takes in a service as a constructor argument.
 */
export class BaseServiceResolver<DTO, QS extends QueryService<DTO, unknown, unknown>> {
  constructor(readonly service: QS) {}
}

export type ExtractPagingStrategy<
  DTO,
  Opts extends QueryArgsTypeOpts<DTO>,
> = Opts['pagingStrategy'] extends PagingStrategies ? Opts['pagingStrategy'] : PagingStrategies.CURSOR;

export type MergePagingStrategyOpts<
  DTO,
  Opts extends QueryArgsTypeOpts<DTO>,
  S extends PagingStrategies,
> = Opts['pagingStrategy'] extends PagingStrategies
  ? Opts
  : S extends PagingStrategies
  ? Omit<Opts, 'pagingStrategy'> & { pagingStrategy: S }
  : Opts;
