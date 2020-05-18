import { ObjectType, ID } from '@nestjs/graphql';
import { FilterableField } from '../../../src/decorators';

@ObjectType()
export class TestResolverDTO {
  @FilterableField(() => ID)
  id!: string;

  @FilterableField()
  stringField!: string;
}
