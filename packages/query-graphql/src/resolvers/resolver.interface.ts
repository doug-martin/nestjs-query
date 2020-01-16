import { QueryService } from '@nestjs-query/core';
import { Resolver } from '@nestjs/graphql';
import { ResolverMethodOptions } from '../decorators';

export type ResolverOptions = ResolverMethodOptions & {
  one?: ResolverMethodOptions;
  many?: ResolverMethodOptions;
};

export interface ServiceResolver<Entity> {
  service: QueryService<Entity>;
}

@Resolver(() => Object, { isAbstract: true })
export class BaseServiceResolver<DTO> {
  constructor(readonly service: QueryService<DTO>) {}
}
