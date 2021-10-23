import { Transform } from 'class-transformer';
import { MinLength } from 'class-validator';
import { GraphQLString } from 'graphql';
import { ArgsType, Directive, Extensions, Field, ObjectType } from '@nestjs/graphql';
import { getFieldsAndDecoratorForType } from '@nestjs/graphql/dist/schema-builder/utils/get-fields-and-decorator.util';
import { FilterableField, PickType } from '../../src';
import { getFilterableFields } from '../../src/decorators';

describe('PickType', () => {
  @ObjectType()
  class CreateUserDto {
    @Transform((str) => `${str.key}_transformed`)
    @MinLength(10)
    @Field({ nullable: true })
    @Directive('@upper')
    login!: string;

    @MinLength(10)
    @Field()
    password!: string;

    @Field({ name: 'id' })
    @Extensions({ extension: true })
    _id!: string;
  }

  class UpdateUserDto extends PickType(CreateUserDto, ['login']) {}

  class UpdateUserWithIdDto extends PickType(CreateUserDto, ['_id']) {}

  it('should inherit "login" field', () => {
    const prototype = Object.getPrototypeOf(UpdateUserDto);
    const { fields } = getFieldsAndDecoratorForType(prototype);
    expect(fields).toHaveLength(1);
    expect(fields[0].name).toEqual('login');
    expect(fields[0].directives?.length).toEqual(1);
    expect(fields[0].directives).toContainEqual({
      fieldName: 'login',
      sdl: '@upper',
      target: prototype,
    });
  });

  it('should inherit renamed "_id" field', () => {
    const { fields } = getFieldsAndDecoratorForType(Object.getPrototypeOf(UpdateUserWithIdDto));
    expect(fields).toHaveLength(1);
    expect(fields[0].name).toEqual('_id');
    expect(fields[0].extensions).toEqual({ extension: true });
  });

  @ArgsType()
  class ArgsType1 {
    @Field() a!: string;

    @FilterableField() b!: string;

    @Field() c!: string;

    @FilterableField() d!: string;

    @Field() e!: string;

    @FilterableField() f!: string;

    @Field(() => GraphQLString) g!: string;

    @Field() h!: string;
  }

  @ObjectType()
  class PickArgsTest1 extends PickType(ArgsType1, ['a', 'c', 'f', 'g', 'h']) {}

  it('should inherit: a, c, f, g, h fields', () => {
    const { fields } = getFieldsAndDecoratorForType(Object.getPrototypeOf(PickArgsTest1));
    const filterableFields = getFilterableFields(PickArgsTest1);
    expect(fields).toHaveLength(5);
    expect(filterableFields).toHaveLength(2);
    expect(filterableFields[0].propertyName).toEqual('f');
    expect(filterableFields[1].propertyName).toEqual('g');
    expect(fields[0].name).toEqual('a');
    expect(fields[1].name).toEqual('c');
    expect(fields[2].name).toEqual('f');
    expect(fields[3].name).toEqual('g');
    expect(fields[4].name).toEqual('h');
  });
});
