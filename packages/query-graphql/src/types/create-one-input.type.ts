import { Class, DeepPartial } from '@nestjs-query/core';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { getDTONames } from '../common';
import { getMetadataStorage } from '../metadata';

export interface CreateOneInputType<DTO, C extends DeepPartial<DTO>> {
  input: C;
}

export function CreateOneInputType<DTO, C extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  CreateClass: Class<C>,
): Class<CreateOneInputType<DTO, C>> {
  const metadataStorage = getMetadataStorage();
  const existing = metadataStorage.getCreateOneInputType<DTO, C>(DTOClass);
  if (existing) {
    return existing;
  }

  const { baseNameLower, baseName } = getDTONames(DTOClass);
  @InputType(`CreateOne${baseName}Input`)
  class CreateOneInput implements CreateOneInputType<DTO, C> {
    @Type(() => CreateClass)
    @ValidateNested()
    @Field(() => CreateClass, { description: 'The record to create', name: baseNameLower })
    input!: C;

    @Type(() => CreateClass)
    get [baseNameLower](): C {
      return this.input;
    }

    set [baseNameLower](input: C) {
      this.input = input;
    }
  }
  metadataStorage.addCreateOneInputType(DTOClass, CreateOneInput);
  return CreateOneInput;
}
