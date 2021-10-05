import { FilterableField, Authorize, QueryOptions, CursorConnection } from '@nestjs-query/query-graphql';
import { ObjectType, ID } from '@nestjs/graphql';
import { ResourceBDTO } from '../resource-b/resource-b.dto';

@ObjectType('ResourceA')
@QueryOptions({ enableTotalCount: true })
@Authorize({
  authorize: () => {
    return {};
  },
})
@CursorConnection('resourceBs', () => ResourceBDTO, { disableRemove: true })
export class ResourceADTO {
  @FilterableField(() => ID)
  id!: number;
}
