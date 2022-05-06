import { ObjectType, ID } from '@nestjs/graphql';
import { FilterableField } from '@ptc/nestjs-query-graphql';

@ObjectType()
export class TestRelationDTO {
  @FilterableField(() => ID)
  id!: string;

  @FilterableField()
  testResolverId!: string;
}
