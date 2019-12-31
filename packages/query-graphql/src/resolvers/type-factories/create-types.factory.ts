import { DeepPartial, CreateMany, CreateOne, Class } from '@nestjs-query/core';
import { InputType } from 'type-graphql';
import { CreateManyInputType, CreateOneInputType, PartialInputType } from '../../types';

export interface CreateResolverTypesOpts<DTO, C extends DeepPartial<DTO>> {
  typeName?: string;
  CreateType?(): Class<C>;
}

export type CreateResolverTypes<DTO, C extends DeepPartial<DTO>> = {
  CreateInputType: Class<C>;
  CreateOneInputType: Class<CreateOne<DTO, C>>;
  CreateManyInputType: Class<CreateMany<DTO, C>>;
};

const defaultCreateInput = <DTO, C extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  baseName: string,
): (() => Class<C>) => {
  return (): Class<C> => {
    @InputType(`Create${baseName}PartialInput`)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    class PartialInput extends PartialInputType(DTOClass) {}

    return PartialInput as Class<C>;
  };
};

export function createResolverTypesFactory<DTO, C extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  opts: CreateResolverTypesOpts<DTO, C>,
): CreateResolverTypes<DTO, C> {
  const baseName = opts.typeName ?? DTOClass.name;

  const { CreateType = defaultCreateInput<DTO, C>(DTOClass, baseName) } = opts;
  const CreateInputType: Class<C> = CreateType();

  @InputType(`${baseName}CreateOneInput`)
  class CreateOneInputTypeImpl extends CreateOneInputType(CreateInputType) {}

  @InputType(`${baseName}CreateManyInput`)
  class CreateManyInputTypeImpl extends CreateManyInputType(CreateInputType) {}

  return { CreateInputType, CreateOneInputType: CreateOneInputTypeImpl, CreateManyInputType: CreateManyInputTypeImpl };
}
