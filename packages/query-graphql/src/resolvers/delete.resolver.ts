import { Class, DeleteManyResponse } from '@nestjs-query/core';
import omit from 'lodash.omit';
import { ObjectType, ArgsType, Resolver, Args, PartialType, InputType } from '@nestjs/graphql';
import { DTONames, getDTONames } from '../common';
import { BaseServiceResolver, ResolverClass, ResolverOpts, ServiceResolver } from './resolver.interface';
import { DeleteManyInputType, DeleteManyResponseType, DeleteOneInputType, MutationArgsType } from '../types';
import { ResolverMutation } from '../decorators';
import { transformAndValidate } from './helpers';

export interface DeleteResolverOpts<DTO> extends ResolverOpts {
  /**
   * ArgsType for deleteOne mutation.
   */
  DeleteOneInput?: Class<DeleteOneInputType>;
  /**
   * ArgsType for deleteMany mutation.
   */
  DeleteManyInput?: Class<DeleteManyInputType<DTO>>;
}

export interface DeleteResolver<DTO> extends ServiceResolver<DTO> {
  deleteOne(input: MutationArgsType<DeleteOneInputType>): Promise<Partial<DTO>>;

  deleteMany(input: MutationArgsType<DeleteManyInputType<DTO>>): Promise<DeleteManyResponse>;
}

/** @internal */
const defaultDeleteManyInput = <DTO>(dtoNames: DTONames, DTOClass: Class<DTO>): Class<DeleteManyInputType<DTO>> => {
  const { pluralBaseName } = dtoNames;
  @InputType(`DeleteMany${pluralBaseName}Input`)
  class DM extends DeleteManyInputType(DTOClass) {}
  return DM;
};

/**
 * @internal
 * Mixin to add `delete` graphql endpoints.
 */
export const Deletable = <DTO>(DTOClass: Class<DTO>, opts: DeleteResolverOpts<DTO>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  BaseClass: B,
): Class<DeleteResolver<DTO>> & B => {
  const dtoNames = getDTONames(DTOClass, opts);
  const { baseName, pluralBaseName } = dtoNames;
  const { DeleteOneInput = DeleteOneInputType(), DeleteManyInput = defaultDeleteManyInput(dtoNames, DTOClass) } = opts;
  const DMR = DeleteManyResponseType();

  const commonResolverOpts = omit(opts, 'dtoName', 'one', 'many', 'DeleteOneInput', 'DeleteManyInput');

  @ObjectType(`${baseName}DeleteResponse`)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  class DeleteOneResponse extends PartialType(DTOClass, ObjectType) {}

  @ArgsType()
  class DO extends MutationArgsType(DeleteOneInput) {}

  @ArgsType()
  class DM extends MutationArgsType(DeleteManyInput) {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class DeleteResolverBase extends BaseClass {
    @ResolverMutation(() => DeleteOneResponse, { name: `deleteOne${baseName}` }, commonResolverOpts, opts.one ?? {})
    async deleteOne(@Args() input: DO): Promise<Partial<DTO>> {
      const deleteOne = await transformAndValidate(DO, input);
      return this.service.deleteOne(deleteOne.input.id);
    }

    @ResolverMutation(() => DMR, { name: `deleteMany${pluralBaseName}` }, commonResolverOpts, opts.many ?? {})
    async deleteMany(@Args() input: DM): Promise<DeleteManyResponse> {
      const deleteMany = await transformAndValidate(DM, input);
      return this.service.deleteMany(deleteMany.input.filter);
    }
  }
  return DeleteResolverBase;
};

export const DeleteResolver = <DTO>(
  DTOClass: Class<DTO>,
  opts: DeleteResolverOpts<DTO> = {},
): ResolverClass<DTO, DeleteResolver<DTO>> => Deletable(DTOClass, opts)(BaseServiceResolver);
