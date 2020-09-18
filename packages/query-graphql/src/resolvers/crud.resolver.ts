import { Class, DeepPartial, QueryService } from '@nestjs-query/core';
import { PagingStrategies } from '../types';
import { Aggregateable, AggregateResolverOpts, AggregateResolver } from './aggregate.resolver';
import { Relatable } from './relations';
import { Readable, ReadResolverFromOpts, ReadResolverOpts } from './read.resolver';
import { Creatable, CreateResolver, CreateResolverOpts } from './create.resolver';
import { Referenceable, ReferenceResolverOpts } from './reference.resolver';
import { MergePagingStrategyOpts, ResolverClass } from './resolver.interface';
import { Updateable, UpdateResolver, UpdateResolverOpts } from './update.resolver';
import { DeleteResolver, DeleteResolverOpts } from './delete.resolver';
import { BaseResolverOptions } from '../decorators/resolver-method.decorator';
import { mergeBaseResolverOpts } from '../common';
import { RelatableOpts } from './relations/relations.resolver';
import { CursorConnectionOptions } from '../types/connection/cursor';

export interface CRUDResolverOpts<
  DTO,
  C = DeepPartial<DTO>,
  U = DeepPartial<DTO>,
  R extends ReadResolverOpts<DTO> = ReadResolverOpts<DTO>,
  PS extends PagingStrategies = PagingStrategies.CURSOR
> extends BaseResolverOptions,
    Pick<CursorConnectionOptions, 'enableTotalCount'> {
  /**
   * The DTO that should be used as input for create endpoints.
   */
  CreateDTOClass?: Class<C>;
  /**
   * The DTO that should be used as input for update endpoints.
   */
  UpdateDTOClass?: Class<U>;
  enableSubscriptions?: boolean;
  pagingStrategy?: PS;
  enableAggregate?: boolean;
  create?: CreateResolverOpts<DTO, C>;
  read?: R;
  update?: UpdateResolverOpts<DTO, U>;
  delete?: DeleteResolverOpts<DTO>;
  referenceBy?: ReferenceResolverOpts;
  aggregate?: AggregateResolverOpts;
}

export interface CRUDResolver<
  DTO,
  C,
  U,
  R extends ReadResolverOpts<DTO>,
  QS extends QueryService<DTO, C, U> = QueryService<DTO, C, U>
> extends CreateResolver<DTO, C, QS>,
    ReadResolverFromOpts<DTO, R, QS>,
    UpdateResolver<DTO, U, QS>,
    DeleteResolver<DTO, QS>,
    AggregateResolver<DTO, QS> {}

/**
 * Factory to create a resolver that includes all CRUD methods from [[CreateResolver]], [[ReadResolver]],
 * [[UpdateResolver]], and [[DeleteResolver]].
 *
 * ```ts
 * import { CRUDResolver } from '@nestjs-query/query-graphql';
 * import { Resolver } from '@nestjs/graphql';
 * import { TodoItemDTO } from './dto/todo-item.dto';
 * import { TodoItemService } from './todo-item.service';
 *
 * @Resolver()
 * export class TodoItemResolver extends CRUDResolver(TodoItemDTO) {
 *   constructor(readonly service: TodoItemService) {
 *     super(service);
 *   }
 * }
 * ```
 * @param DTOClass - The DTO Class that the resolver is for. All methods will use types derived from this class.
 * @param opts - Options to customize the resolver.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export const CRUDResolver = <
  DTO,
  C = DeepPartial<DTO>,
  U = DeepPartial<DTO>,
  R extends ReadResolverOpts<DTO> = ReadResolverOpts<DTO>,
  PS extends PagingStrategies = PagingStrategies.CURSOR
>(
  DTOClass: Class<DTO>,
  opts: CRUDResolverOpts<DTO, C, U, R, PS> = {},
): ResolverClass<DTO, QueryService<DTO, C, U>, CRUDResolver<DTO, C, U, MergePagingStrategyOpts<DTO, R, PS>>> => {
  const {
    CreateDTOClass,
    UpdateDTOClass,
    enableSubscriptions,
    pagingStrategy,
    enableTotalCount,
    enableAggregate,
    create = {},
    read = {},
    update = {},
    delete: deleteArgs = {},
    referenceBy = {},
    aggregate,
  } = opts;

  const referencable = Referenceable(DTOClass, referenceBy);
  const relatable = Relatable(
    DTOClass,
    mergeBaseResolverOpts({ enableTotalCount, enableAggregate } as RelatableOpts, opts),
  );
  const aggregateable = Aggregateable(DTOClass, {
    enabled: enableAggregate,
    ...mergeBaseResolverOpts(aggregate ?? {}, opts),
  });
  const creatable = Creatable(DTOClass, {
    CreateDTOClass,
    enableSubscriptions,
    ...mergeBaseResolverOpts(create ?? {}, opts),
  });
  const readable = Readable(DTOClass, {
    enableTotalCount,
    pagingStrategy,
    ...mergeBaseResolverOpts(read, opts),
  } as MergePagingStrategyOpts<DTO, R, PS>);
  const updateable = Updateable(DTOClass, {
    UpdateDTOClass,
    enableSubscriptions,
    ...mergeBaseResolverOpts(update, opts),
  });
  const deleteResolver = DeleteResolver(DTOClass, { enableSubscriptions, ...mergeBaseResolverOpts(deleteArgs, opts) });

  return referencable(relatable(aggregateable(creatable(readable(updateable(deleteResolver))))));
};
