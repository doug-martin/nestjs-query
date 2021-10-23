import { Directive, Extensions, Field, ObjectType } from '@nestjs/graphql';
import { getFieldsAndDecoratorForType } from '@nestjs/graphql/dist/schema-builder/utils/get-fields-and-decorator.util';
import { FilterableField, IntersectionType } from '../../src';
import { METADATA_FACTORY_NAME } from '@nestjs/graphql/dist/plugin/plugin-constants';
import { getFilterableFields } from '../../src/decorators';

describe('IntersectionType', () => {
  @ObjectType()
  class ClassA {
    @Field({ nullable: true })
    @Directive('@upper')
    @Extensions({ extension: true })
    login!: string;

    @FilterableField()
    password!: string;
  }

  @ObjectType()
  class ClassB {
    @FilterableField()
    @Directive('@upper')
    @Extensions({ extension: true })
    lastName!: string;

    firstName?: string;

    static [METADATA_FACTORY_NAME]() {
      return {
        firstName: { nullable: true, type: () => String },
      };
    }
  }

  class UpdateUserDto extends IntersectionType(ClassA, ClassB) {}

  it('should inherit all fields from two types', () => {
    const prototype = Object.getPrototypeOf(UpdateUserDto);
    const { fields } = getFieldsAndDecoratorForType(prototype);
    const filterableFields = getFilterableFields(UpdateUserDto);
    expect(filterableFields).toHaveLength(2);
    expect(filterableFields[0].propertyName).toEqual('password');
    expect(filterableFields[1].propertyName).toEqual('lastName');
    expect(fields).toHaveLength(4);
    expect(fields[0].name).toEqual('login');
    expect(fields[1].name).toEqual('password');
    expect(fields[2].name).toEqual('lastName');
    expect(fields[3].name).toEqual('firstName');
    expect(fields[0].directives?.length).toEqual(1);
    expect(fields[0].directives).toContainEqual({
      fieldName: 'login',
      sdl: '@upper',
      target: prototype,
    });
    expect(fields[0].extensions).toEqual({
      extension: true,
    });
    expect(fields[2].directives?.length).toEqual(1);
    expect(fields[2].directives).toContainEqual({
      fieldName: 'lastName',
      sdl: '@upper',
      target: prototype,
    });
    expect(fields[2].extensions).toEqual({
      extension: true,
    });
  });
});
