import { Class, CreateMany, CreateOne, DeepPartial } from '@nestjs-query/core';
import { ArgsType } from 'type-graphql';
import { Resolver, Args } from '@nestjs/graphql';
import { BaseServiceResolver, ServiceResolver } from './resolver.interface';
import { CreateManyArgsType, CreateOneArgsType } from '../types';
import { ResolverMethodOptions, ResolverMutation } from '../decorators';
import { getDTONames, transformAndValidate } from './helpers';

export interface CreateResolver<DTO, C extends DeepPartial<DTO>> extends ServiceResolver<DTO> {
  createOne(input: CreateOneArgsType<DTO, C>): Promise<DTO>;
  createMany(input: CreateManyArgsType<DTO, C>): Promise<DTO[]>;
}

export type CreateResolverArgs<DTO, C extends DeepPartial<DTO> = DeepPartial<DTO>> = {
  CreateDTOClass?: Class<C>;
  dtoName?: string;
  CreateOneArgs?: Class<CreateOneArgsType<DTO, C>>;
  CreateManyArgs?: Class<CreateManyArgsType<DTO, C>>;
  createOne?: ResolverMethodOptions;
  createMany?: ResolverMethodOptions;
};

export const Creatable = <DTO, C extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  args: CreateResolverArgs<DTO, C> = {},
) => <B extends Class<ServiceResolver<DTO>>>(BaseClass: B): Class<CreateResolver<DTO, C>> & B => {
  const {
    CreateDTOClass = DTOClass as Class<DeepPartial<DTO>>,
    CreateOneArgs = CreateOneArgsType(CreateDTOClass),
    CreateManyArgs = CreateManyArgsType(CreateDTOClass),
  } = args;
  const { baseName, pluralBaseName } = getDTONames(args, DTOClass);

  @ArgsType()
  class CO extends CreateOneArgs {}

  @ArgsType()
  class CM extends CreateManyArgs {}

  @Resolver(() => DTOClass, { isAbstract: true })
  class ResolverBase extends BaseClass {
    @ResolverMutation(() => DTOClass, { name: `createOne${baseName}` }, args.createOne ?? {})
    async createOne(@Args() input: CO): Promise<DTO> {
      const createOne = await transformAndValidate(CO, input as DeepPartial<CO>);
      return this.service.createOne(ResolverBase.transformCreateOneArgs(createOne));
    }

    @ResolverMutation(() => [DTOClass], { name: `createMany${pluralBaseName}` }, args.createMany ?? {})
    async createMany(@Args() input: CM): Promise<DTO[]> {
      const createMany = await transformAndValidate(CM, input);
      return this.service.createMany(ResolverBase.transformCreateManyArgs(createMany));
    }

    private static transformCreateOneArgs(co: CO): CreateOne<DTO, DeepPartial<DTO>> {
      return { item: co.input };
    }

    private static transformCreateManyArgs(cm: CM): CreateMany<DTO, DeepPartial<DTO>> {
      return { items: cm.input };
    }
  }

  return ResolverBase;
};

type CreateResolverType<DTO, C extends DeepPartial<DTO>> = Class<CreateResolver<DTO, C>> &
  Class<BaseServiceResolver<DTO>>;

export const CreateResolver = <DTO, C extends DeepPartial<DTO> = DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  args: CreateResolverArgs<DTO, C> = {},
): CreateResolverType<DTO, C> => Creatable(DTOClass, args)(BaseServiceResolver);
