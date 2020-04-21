import { QueryService } from '@nestjs-query/core';
import { DTONamesOpts } from '../common';
import { ResolverMethodOpts } from '../decorators';
import { RelationsOpts } from './relations';

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
   * All relations that should be exposed on this resolver through `@ResolveField` from `@nestjs/graphql`
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
export class BaseServiceResolver<DTO> {
  constructor(readonly service: QueryService<DTO>) {}
}
