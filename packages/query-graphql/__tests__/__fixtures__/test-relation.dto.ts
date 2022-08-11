import { ID, ObjectType } from '@nestjs/graphql'
import { FilterableField } from '@ptc-org/nestjs-query-graphql'

@ObjectType()
export class TestRelationDTO {
  @FilterableField(() => ID)
  id!: string

  @FilterableField()
  testResolverId!: string
}
