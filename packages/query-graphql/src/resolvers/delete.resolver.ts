import { Class, DeleteManyResponse } from '@nestjs-query/core';
import omit from 'lodash.omit';
import { ArgsType, ObjectType } from 'type-graphql';
import { Resolver, Args } from '@nestjs/graphql';
import { BaseServiceResolver, ResolverClass, ResolverOpts, ServiceResolver } from './resolver.interface';
import { DeleteManyArgsType, DeleteManyResponseType, DeleteOneArgsType, FilterType, PartialType } from '../types';
import { ResolverMutation } from '../decorators';
import { DTONamesOpts, getDTONames, transformAndValidate } from './helpers';

export interface DeleteResolverOpts<DTO> extends DTONamesOpts, ResolverOpts {
  /**
   * ArgsType for deleteOne mutation.
   */
  DeleteOneArgs?: Class<DeleteOneArgsType>;
  /**
   * ArgsType for deleteMany mutation.
   */
  DeleteManyArgs?: Class<DeleteManyArgsType<DTO>>;
}

export interface DeleteResolver<DTO> extends ServiceResolver<DTO> {
  deleteOne(input: DeleteOneArgsType): Promise<Partial<DTO>>;

  deleteMany(input: DeleteManyArgsType<DTO>): Promise<DeleteManyResponse>;
}

/**
 * @internal
 * Mixin to add `delete` graphql endpoints.
 */
export const Deletable = <DTO>(DTOClass: Class<DTO>, opts: DeleteResolverOpts<DTO>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  BaseClass: B,
): Class<DeleteResolver<DTO>> & B => {
  const { baseName, pluralBaseName } = getDTONames(opts, DTOClass);
  const { DeleteOneArgs = DeleteOneArgsType(), DeleteManyArgs = DeleteManyArgsType(FilterType(DTOClass)) } = opts;
  const DMR = DeleteManyResponseType();

  const commonResolverOpts = omit(opts, 'dtoName', 'one', 'many', 'DeleteOneArgs', 'DeleteManyArgs');

  @ObjectType(`${baseName}DeleteResponse`)
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  class DeleteOneResponse extends PartialType(DTOClass) {}

  @ArgsType()
  class DO extends DeleteOneArgs {}

  @ArgsType()
  class DM extends DeleteManyArgs {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class ResolverBase extends BaseClass {
    @ResolverMutation(() => DeleteOneResponse, { name: `deleteOne${baseName}` }, commonResolverOpts, opts.one ?? {})
    async deleteOne(@Args() input: DO): Promise<Partial<DTO>> {
      const deleteOne = await transformAndValidate(DO, input);
      return this.service.deleteOne(deleteOne.input);
    }

    @ResolverMutation(() => DMR, { name: `deleteMany${pluralBaseName}` }, commonResolverOpts, opts.many ?? {})
    async deleteMany(@Args() input: DM): Promise<DeleteManyResponse> {
      const deleteMany = await transformAndValidate(DM, input);
      return this.service.deleteMany(deleteMany.input);
    }
  }

  return ResolverBase;
};

export const DeleteResolver = <DTO>(
  DTOClass: Class<DTO>,
  opts: DeleteResolverOpts<DTO> = {},
): ResolverClass<DTO, DeleteResolver<DTO>> => Deletable(DTOClass, opts)(BaseServiceResolver);
