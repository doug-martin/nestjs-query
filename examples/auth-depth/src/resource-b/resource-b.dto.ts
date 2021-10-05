import { FilterableField, Authorize, QueryOptions, CursorConnection } from '@nestjs-query/query-graphql';
import { ObjectType, ID } from '@nestjs/graphql';
import { ResourceCDTO } from '../resource-c/resource-c.dto';

@ObjectType('ResourceB')
@QueryOptions({ enableTotalCount: true })
@Authorize({
  authorize: () => {
    return {};
  },
})
@CursorConnection('resourceCs', () => ResourceCDTO, { disableRemove: true })
export class ResourceBDTO {
  @FilterableField(() => ID)
  id!: number;
}
