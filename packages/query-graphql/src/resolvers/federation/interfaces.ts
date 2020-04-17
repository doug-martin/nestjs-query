import { Class } from '@nestjs-query/core';
import { DTONamesOpts } from '../../common';
import { ResolverMethodOpts } from '../../decorators';

export interface FederatedRelation<Relation> extends DTONamesOpts, ResolverMethodOpts {
  /**
   * The class type of the relation.
   */
  DTO: Class<Relation>;
  /**
   * Set to true if the relation is nullable
   */
  nullable?: boolean;
}

export type FederatedRelationMap = Record<string, FederatedRelation<unknown>>;

export interface FederatedRelationsOpts {
  /**
   * All relations that are a single record
   */
  one?: FederatedRelationMap;
  /**
   * All relations that have multiple records
   */
  many?: FederatedRelationMap;
}
