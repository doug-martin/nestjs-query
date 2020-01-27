import { QueryService } from '@nestjs-query/core';
import { Resolver } from '@nestjs/graphql';
import { ResolverMethodOpts } from '../decorators';

export interface ResolverOpts extends ResolverMethodOpts {
  one?: ResolverMethodOpts;
  many?: ResolverMethodOpts;
}

export interface ServiceResolver<Entity> {
  service: QueryService<Entity>;
}

export interface ResolverClass<Entity, Resolver extends ServiceResolver<Entity>> {
  new (service: QueryService<Entity>): Resolver;
}

/**
 * @internal
 * Base Resolver that takes in a service as a constructor argument.
 */
@Resolver(() => Object, { isAbstract: true })
export class BaseServiceResolver<DTO> {
  constructor(readonly service: QueryService<DTO>) {}
}
