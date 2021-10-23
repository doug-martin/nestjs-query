import { Transform } from 'class-transformer';
import { MinLength } from 'class-validator';
import { Directive, Extensions, Field, ObjectType } from '@nestjs/graphql';
import { getFieldsAndDecoratorForType } from '@nestjs/graphql/dist/schema-builder/utils/get-fields-and-decorator.util';
import { FilterableField, OmitType } from '../../src';
import { getFilterableFields } from '../../src/decorators';

describe('OmitType', () => {
  @ObjectType()
  class CreateUserDto {
    @MinLength(10)
    @FilterableField({ nullable: true })
    login!: string;

    @Transform((str) => `${str.key}_transformed`)
    @MinLength(10)
    @FilterableField({ nullable: true })
    @Directive('@upper')
    @Extensions({ extension: true })
    password!: string;

    @Field({ name: 'id' })
    _id!: string;
  }

  class UpdateUserDto extends OmitType(CreateUserDto, ['login', '_id']) {}

  it('should inherit all fields except for "login" and "_id"', () => {
    const prototype = Object.getPrototypeOf(UpdateUserDto);
    const { fields } = getFieldsAndDecoratorForType(prototype);
    const filterableFields = getFilterableFields(UpdateUserDto);
    expect(filterableFields).toHaveLength(1);
    expect(filterableFields[0].propertyName).toEqual('password');
    expect(filterableFields[0].advancedOptions).toMatchObject({ nullable: true });
    expect(fields).toHaveLength(1);
    expect(fields[0].name).toEqual('password');
    expect(fields[0].directives?.length).toEqual(1);
    expect(fields[0].directives).toContainEqual({
      fieldName: 'password',
      sdl: '@upper',
      target: prototype,
    });
    expect(fields[0].extensions).toEqual({
      extension: true,
    });
  });
});
