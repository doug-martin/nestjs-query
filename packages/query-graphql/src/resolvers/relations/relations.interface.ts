import { Class } from '@nestjs-query/core';
import { Complexity } from '@nestjs/graphql';
import { DTONamesOpts } from '../../common';
import { ResolverMethodOpts } from '../../decorators';
import { QueryArgsTypeOpts, ConnectionOptions } from '../../types';

import { AuthorizerOptions } from '../../auth';

export type ReferencesKeys<DTO, Reference> = {
  [F in keyof Reference]?: keyof DTO;
};

export interface ResolverRelationReference<DTO, Reference> extends DTONamesOpts, ResolverMethodOpts {
  /**
   * The class type of the relation.
   */
  DTO: Class<Reference>;

  /**
   * Keys
   */
  keys: ReferencesKeys<DTO, Reference>;

  /**
   * Set to true if the relation is nullable
   */
  nullable?: boolean;

  complexity?: Complexity;
}

export type ResolverRelation<Relation> = {
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

  /**
   * Enable aggregation queries.
   */
  enableAggregate?: boolean;

  /**
   * Set to true if you should be able to filter on this relation.
   *
   * This will only work with relations defined through an ORM (typeorm or sequelize).
   */
  allowFiltering?: boolean;

  complexity?: Complexity;

  auth?: AuthorizerOptions<Relation>;
} & DTONamesOpts &
  ResolverMethodOpts &
  QueryArgsTypeOpts<Relation> &
  Pick<ConnectionOptions, 'enableTotalCount'>;

export type RelationTypeMap<RT> = Record<string, RT>;

export type RelationsOpts = {
  /**
   * All relations that are a single record
   */
  one?: RelationTypeMap<ResolverRelation<unknown>>;
  /**
   * All relations that have multiple records
   */
  many?: RelationTypeMap<ResolverRelation<unknown>>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReferencesOpts<DTO> = RelationTypeMap<ResolverRelationReference<DTO, any>>;
