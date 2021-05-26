import { ObjectType, ID } from '@nestjs/graphql';
import { FilterableField } from '../../src';

@ObjectType()
export class TestRelationDTO {
  @FilterableField(() => ID)
  id!: string;

  @FilterableField()
  testResolverId!: string;
}
