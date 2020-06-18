import { Class, DeepPartial } from '@nestjs-query/core';
import { PagingStrategies } from '../types';
import { ReferencesOpts, Relatable, RelationsOpts } from './relations';
import { Readable, ReadResolverFromOpts, ReadResolverOpts } from './read.resolver';
import { Creatable, CreateResolver, CreateResolverOpts } from './create.resolver';
import { Refereceable, ReferenceResolverOpts } from './reference.resolver';
import { MergePagingStrategyOpts, ResolverClass } from './resolver.interface';
import { Updateable, UpdateResolver, UpdateResolverOpts } from './update.resolver';
import { DeleteResolver, DeleteResolverOpts } from './delete.resolver';

export interface CRUDResolverOpts<
  DTO,
  C extends DeepPartial<DTO> = DeepPartial<DTO>,
  U extends DeepPartial<DTO> = DeepPartial<DTO>,
  R extends ReadResolverOpts<DTO> = ReadResolverOpts<DTO>,
  PS extends PagingStrategies = PagingStrategies.CURSOR
> {
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
  create?: CreateResolverOpts<DTO, C>;
  read?: R;
  update?: UpdateResolverOpts<DTO, U>;
  delete?: DeleteResolverOpts<DTO>;
  relations?: RelationsOpts;
  references?: ReferencesOpts<DTO>;
  reference?: ReferenceResolverOpts<DTO>;
  referenceBy?: ReferenceResolverOpts<DTO>;
}

export interface CRUDResolver<
  DTO,
  C extends DeepPartial<DTO>,
  U extends DeepPartial<DTO>,
  R extends ReadResolverOpts<DTO>
> extends CreateResolver<DTO, C>, ReadResolverFromOpts<DTO, R>, UpdateResolver<DTO, U>, DeleteResolver<DTO> {}

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
export const CRUDResolver = <
  DTO,
  C extends DeepPartial<DTO> = DeepPartial<DTO>,
  U extends DeepPartial<DTO> = DeepPartial<DTO>,
  R extends ReadResolverOpts<DTO> = ReadResolverOpts<DTO>,
  PS extends PagingStrategies = PagingStrategies.CURSOR
>(
  DTOClass: Class<DTO>,
  opts: CRUDResolverOpts<DTO, C, U, R, PS> = {},
): ResolverClass<DTO, CRUDResolver<DTO, C, U, MergePagingStrategyOpts<DTO, R, PS>>> => {
  const {
    CreateDTOClass,
    UpdateDTOClass,
    enableSubscriptions,
    pagingStrategy,
    relations = {},
    references = {},
    create = {},
    read = {},
    update = {},
    delete: deleteArgs = {},
    referenceBy = {},
  } = opts;

  const referencable = Refereceable(DTOClass, referenceBy);
  const relatable = Relatable(DTOClass, { relations, references, pagingStrategy });
  const creatable = Creatable(DTOClass, { CreateDTOClass, enableSubscriptions, ...create });
  const readable = Readable(DTOClass, { pagingStrategy, ...read } as MergePagingStrategyOpts<DTO, R, PS>);
  const updateable = Updateable(DTOClass, { UpdateDTOClass, enableSubscriptions, ...update });
  const deleteResolver = DeleteResolver(DTOClass, { enableSubscriptions, ...deleteArgs });

  return referencable(relatable(creatable(readable(updateable(deleteResolver)))));
};
