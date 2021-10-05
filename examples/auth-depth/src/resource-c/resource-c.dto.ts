import { FilterableField, Authorize, QueryOptions } from '@nestjs-query/query-graphql';
import { ObjectType, ID } from '@nestjs/graphql';

@ObjectType('ResourceC')
@QueryOptions({ enableTotalCount: true })
@Authorize({
  authorize: () => {
    return {};
  },
})
export class ResourceCDTO {
  @FilterableField(() => ID)
  id!: number;
}
