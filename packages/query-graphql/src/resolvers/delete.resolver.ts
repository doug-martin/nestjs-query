import { Class, DeepPartial, DeleteMany, DeleteManyResponse, DeleteOne } from '@nestjs-query/core';
import omit from 'lodash.omit';
import { ArgsType, ObjectType } from 'type-graphql';
import { Resolver, Args } from '@nestjs/graphql';
import { BaseServiceResolver, ResolverOptions, ServiceResolver } from './resolver.interface';
import { DeleteManyArgsType, DeleteManyResponseType, DeleteOneArgsType, FilterType, PartialType } from '../types';
import { ResolverMutation } from '../decorators';
import { DTONamesOpts, getDTONames, transformAndValidate } from './helpers';

export interface DeleteResolver<DTO> extends ServiceResolver<DTO> {
  deleteOne(input: DeleteOne): Promise<Partial<DTO>>;

  deleteMany(input: DeleteMany<DTO>): Promise<DeleteManyResponse>;
}

export type DeleteResolverArgs<DTO> = DTONamesOpts &
  ResolverOptions & {
    DeleteOneArgs?: Class<DeleteOne>;
    DeleteManyArgs?: Class<DeleteMany<DTO>>;
  };

export const Deletable = <DTO>(DTOClass: Class<DTO>, args: DeleteResolverArgs<DTO> = {}) => <
  B extends Class<ServiceResolver<DTO>>
>(
  BaseClass: B,
): Class<DeleteResolver<DTO>> & B => {
  const { baseName, pluralBaseName } = getDTONames(args, DTOClass);
  const { DeleteOneArgs = DeleteOneArgsType(), DeleteManyArgs = DeleteManyArgsType(FilterType(DTOClass)) } = args;
  const DMR = DeleteManyResponseType();

  const commonResolverOptions = omit(args, 'dtoName', 'one', 'many', 'DeleteOneArgs', 'DeleteManyArgs');

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
    @ResolverMutation(() => DeleteOneResponse, { name: `deleteOne${baseName}` }, commonResolverOptions, args.one ?? {})
    async deleteOne(@Args() input: DO): Promise<Partial<DTO>> {
      const deleteOne = await transformAndValidate(DO, input as DeepPartial<DO>);
      return this.service.deleteOne(deleteOne);
    }

    @ResolverMutation(() => DMR, { name: `deleteMany${pluralBaseName}` }, commonResolverOptions, args.many ?? {})
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
