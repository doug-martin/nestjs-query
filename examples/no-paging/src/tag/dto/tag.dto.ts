import { GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql'
import { FilterableField, PagingStrategies, QueryOptions, UnPagedRelation } from '@ptc-org/nestjs-query-graphql'

import { TodoItemDTO } from '../../todo-item/dto/todo-item.dto'

@ObjectType('Tag')
@QueryOptions({ pagingStrategy: PagingStrategies.NONE })
@UnPagedRelation('todoItems', () => TodoItemDTO)
export class TagDTO {
  @FilterableField(() => ID)
  id!: number

  @FilterableField()
  name!: string

  @FilterableField(() => GraphQLISODateTime)
  created!: Date

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date
}
