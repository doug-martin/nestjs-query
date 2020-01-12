import { Class, DeepPartial, DeleteMany, DeleteManyResponse, DeleteOne } from '@nestjs-query/core';
import { ArgsType } from 'type-graphql';
import { Resolver, Args } from '@nestjs/graphql';
import { BaseServiceResolver, ServiceResolver } from './resolver.interface';
import { DeleteManyArgsType, DeleteManyResponseType, DeleteOneArgsType, FilterType } from '../types';
import { ResolverMethodOptions, ResolverMutation } from '../decorators';
import { getDTONames, transformAndValidate } from './helpers';

export interface DeleteResolver<DTO> extends ServiceResolver<DTO> {
  deleteOne(input: DeleteOne): Promise<Partial<DTO>>;

  deleteMany(input: DeleteMany<DTO>): Promise<DeleteManyResponse>;
}

export type DeleteResolverArgs<DTO> = {
  dtoName?: string;
  DeleteOneArgs?: Class<DeleteOne>;
  DeleteManyArgs?: Class<DeleteMany<DTO>>;
  deleteOne?: ResolverMethodOptions;
  deleteMany?: ResolverMethodOptions;
};

export const Deletable = <DTO>(DTOClass: Class<DTO>, args: DeleteResolverArgs<DTO> = {}) => <
  B extends Class<ServiceResolver<DTO>>
>(
  BaseClass: B,
): Class<DeleteResolver<DTO>> & B => {
  const { DeleteOneArgs = DeleteOneArgsType(), DeleteManyArgs = DeleteManyArgsType(FilterType(DTOClass)) } = args;
  const DMR = DeleteManyResponseType();
  const { baseName, pluralBaseName } = getDTONames(args, DTOClass);

  @ArgsType()
  class DO extends DeleteOneArgs {}

  @ArgsType()
  class DM extends DeleteManyArgs {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class ResolverBase extends BaseClass {
    @ResolverMutation(() => DTOClass, { name: `deleteOne${baseName}` }, args.deleteOne ?? {})
    async deleteOne(@Args() input: DO): Promise<Partial<DTO>> {
      const deleteOne = await transformAndValidate(DO, input as DeepPartial<DO>);
      return this.service.deleteOne(deleteOne);
    }

    @ResolverMutation(() => DMR, { name: `deleteMany${pluralBaseName}` }, args.deleteMany ?? {})
    async deleteMany(@Args() input: DM): Promise<DeleteManyResponse> {
      const deleteMany = await transformAndValidate(DM, input as DeepPartial<DM>);
      return this.service.deleteMany(deleteMany);
    }
  }

  return ResolverBase;
};

type DeleteResolverType<DTO> = Class<DeleteResolver<DTO>> & Class<BaseServiceResolver<DTO>>;
export const DeleteResolver = <DTO>(
  DTOClass: Class<DTO>,
  args: DeleteResolverArgs<DTO> = {},
): DeleteResolverType<DTO> => Deletable(DTOClass, args)(BaseServiceResolver);
