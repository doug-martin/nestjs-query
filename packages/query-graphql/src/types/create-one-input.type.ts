import { Class } from '@nestjs-query/core';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

export interface CreateOneInputType<C> {
  input: C;
}

/**
 * The abstract input type for create one operations.
 *
 * @param fieldName - The name of the field to be exposed in the graphql schema
 * @param InputClass - The InputType to be used.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function CreateOneInputType<C>(fieldName: string, InputClass: Class<C>): Class<CreateOneInputType<C>> {
  @InputType({ isAbstract: true })
  class CreateOneInput implements CreateOneInputType<C> {
    @Type(() => InputClass)
    @ValidateNested()
    @Field(() => InputClass, { description: 'The record to create', name: fieldName })
    input!: C;

    @Type(() => InputClass)
    get [fieldName](): C {
      return this.input;
    }

    set [fieldName](input: C) {
      this.input = input;
    }
  }
  return CreateOneInput;
}
