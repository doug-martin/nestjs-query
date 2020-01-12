import { QueryService } from '@nestjs-query/core';
import { Resolver } from '@nestjs/graphql';

export interface ServiceResolver<Entity> {
  service: QueryService<Entity>;
}

@Resolver(() => Object, { isAbstract: true })
export class BaseServiceResolver<DTO> {
  constructor(readonly service: QueryService<DTO>) {}
}
