import { Class, DeepPartial } from '@nestjs-query/core';
import { Type } from 'class-transformer';
import { ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { getDTONames } from '../common';
import { getMetadataStorage } from '../metadata';

export interface CreateManyInputType<DTO, C extends DeepPartial<DTO>> {
  input: C[];
}

export function CreateManyInputType<DTO, C extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  CreateClass: Class<C>,
): Class<CreateManyInputType<DTO, C>> {
  const metadataStorage = getMetadataStorage();
  const existing = metadataStorage.getCreateManyInputType<DTO, C>(DTOClass);
  if (existing) {
    return existing;
  }

  const { pluralBaseNameLower, pluralBaseName } = getDTONames(DTOClass);
  @InputType(`CreateMany${pluralBaseName}Input`)
  class CreateManyInput implements CreateManyInputType<DTO, C> {
    @Type(() => CreateClass)
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Field(() => [CreateClass], { description: 'Array of records to create', name: pluralBaseNameLower })
    input!: C[];

    @Type(() => CreateClass)
    get [pluralBaseNameLower](): C[] {
      return this.input;
    }

    set [pluralBaseNameLower](input: C[]) {
      this.input = input;
    }
  }
  metadataStorage.addCreateManyInputType(DTOClass, CreateManyInput);
  return CreateManyInput;
}
