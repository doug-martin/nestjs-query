import { Class } from '@nestjs-query/core';
import { DTONamesOpts } from '../../common';
import { ResolverMethodOpts } from '../../decorators';

export type ReferencesKeys<DTO, Relation> = {
  [F in keyof Relation]?: keyof DTO;
};

export interface ResolverRelationReference<DTO, Relation> extends DTONamesOpts, ResolverMethodOpts {
  /**
   * The class type of the relation.
   */
  DTO: Class<Relation>;

  /**
   * Keys
   */
  keys: ReferencesKeys<DTO, Relation>;

  /**
   * Set to true if the relation is nullable
   */
  nullable?: boolean;
}

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

export type RelationTypeMap<RT> = Record<string, RT>;

export type RelationTypeOpts<RT> = {
  /**
   * All relations that are a single record
   */
  one?: RelationTypeMap<ResolverRelation<unknown>>;
  /**
   * All relations that have multiple records
   */
  many?: RelationTypeMap<ResolverRelation<unknown>>;
};

export type RelationsOpts = RelationTypeOpts<ResolverRelation<unknown>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReferencesOpts<DTO> = RelationTypeMap<ResolverRelationReference<DTO, any>>;
