import { ID, ObjectType } from '@nestjs/graphql'

import { Authorize, FilterableField } from '../../src/decorators'
import { TestResolverAuthorizer } from './test-resolver.authorizer'

@ObjectType()
@Authorize(TestResolverAuthorizer)
export class TestResolverDTO {
  @FilterableField(() => ID)
  id!: string

  @FilterableField()
  stringField!: string
}
