import { DeepPartial, CreateMany, CreateOne } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { InputType } from 'type-graphql';
import { GraphQLCreateManyInput, GraphQLCreateOneInput, PartialInputType } from '../../types';

export interface CreateResolverTypesOpts<DTO, C extends DeepPartial<DTO>> {
  typeName?: string;
  CreateType?(): Type<C>;
};

export type CreateResolverTypes<DTO, C extends DeepPartial<DTO>> = {
  CreateInputType: Type<C>;
  CreateOneInputType: Type<CreateOne<DTO, C>>;
  CreateManyInputType: Type<CreateMany<DTO, C>>;
};

const defaultCreateInput = <DTO, C extends DeepPartial<DTO>>(
  DTOClass: Type<DTO>,
  baseName: string,
): (() => Type<C>) => {
  return (): Type<C> => {
    @InputType(`Create${baseName}PartialInput`)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    class PartialInput extends PartialInputType(DTOClass) {}

    return PartialInput as Type<C>;
  };
};

export function createResolverTypesFactory<DTO, C extends DeepPartial<DTO>>(
  DTOClass: Type<DTO>,
  opts: CreateResolverTypesOpts<DTO, C>,
): CreateResolverTypes<DTO, C> {
  const baseName = opts.typeName ?? DTOClass.name;

  const { CreateType = defaultCreateInput<DTO, C>(DTOClass, baseName) } = opts;
  const CreateInputType: Type<C> = CreateType();

  @InputType(`${baseName}CreateOneInput`)
  class CreateOneInputType extends GraphQLCreateOneInput(CreateInputType) {}

  @InputType(`${baseName}CreateManyInput`)
  class CreateManyInputType extends GraphQLCreateManyInput(CreateInputType) {}

  return { CreateInputType, CreateOneInputType, CreateManyInputType };
}
