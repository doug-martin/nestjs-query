import { Class } from '@nestjs-query/core';
import { Type } from 'class-transformer';
import { ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

export interface CreateManyInputType<C> {
  input: C[];
}

/**
 * The abstract input type for create many input types.
 * @param fieldName - the name of field to be exposed in the graphql schema
 * @param InputClass - the InputType to be used.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function CreateManyInputType<C>(fieldName: string, InputClass: Class<C>): Class<CreateManyInputType<C>> {
  @InputType({ isAbstract: true })
  class CreateManyInput implements CreateManyInputType<C> {
    @Type(() => InputClass)
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Field(() => [InputClass], { description: 'Array of records to create', name: fieldName })
    input!: C[];

    @Type(() => InputClass)
    get [fieldName](): C[] {
      return this.input;
    }

    set [fieldName](input: C[]) {
      this.input = input;
    }
  }
  return CreateManyInput;
}
