import { Class, QueryService } from '@nestjs-query/core';
import { Resolver } from '@nestjs/graphql';
import { ResolverMethodOpts } from '../decorators';
import { DTONamesOpts } from './helpers';

export interface ResolverRelation<Relation> extends DTONamesOpts, ResolverMethodOpts {
  /**
   * The class type of the relation.
   */
  DTO: Class<Relation>;
  /**
   * The name of the relation to use when fetching from the QueryService
   */
  relationName?: string;
  /**
   * Set to true if the relation is nullable
   */
  nullable?: boolean;
  /**
   * Disable read relation graphql endpoints
   */
  disableRead?: boolean;
  /**
   * Disable update relation graphql endpoints
   */
  disableUpdate?: boolean;
  /**
   * Disable remove relation graphql endpoints
   */
  disableRemove?: boolean;
}

export type RelationMap = Record<string, ResolverRelation<unknown>>;

export interface RelationsOpts {
  /**
   * All relations that are a single record
   */
  one?: RelationMap;
  /**
   * All relations that have multiple records
   */
  many?: RelationMap;
}

export interface ResolverOpts extends ResolverMethodOpts, DTONamesOpts {
  /**
   * Options for single record graphql endpoints
   */
  one?: ResolverMethodOpts;
  /**
   * Options for multiple record graphql endpoints
   */
  many?: ResolverMethodOpts;
  /**
   * All relations that should be exposed on this resolver through `@ResolveProperty` from `type-graphql`
   */
  relations?: RelationsOpts;
}

/** @internal */
export interface ServiceResolver<DTO> {
  service: QueryService<DTO>;
}

/** @internal */
export interface ResolverClass<DTO, Resolver extends ServiceResolver<DTO>> {
  new (service: QueryService<DTO>): Resolver;
}

/**
 * @internal
 * Base Resolver that takes in a service as a constructor argument.
 */
@Resolver(() => Object, { isAbstract: true })
export class BaseServiceResolver<DTO> {
  constructor(readonly service: QueryService<DTO>) {}
}
