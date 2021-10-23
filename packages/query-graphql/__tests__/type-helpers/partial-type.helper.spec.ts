import { Expose, Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { Directive, Extensions, Field, ObjectType } from '@nestjs/graphql';
import { getFieldsAndDecoratorForType } from '@nestjs/graphql/dist/schema-builder/utils/get-fields-and-decorator.util';
import { FilterableField, PartialType } from '../../src';
import { getFilterableFields } from '../../src/decorators';

describe('PartialType', () => {
  @ObjectType({ isAbstract: true })
  abstract class BaseType {
    @FilterableField()
    @Directive('@upper')
    @Extensions({ extension: true })
    id!: string;

    @Field()
    createdAt!: Date;

    @FilterableField()
    updatedAt!: Date;
  }

  @ObjectType()
  class CreateUserDto extends BaseType {
    @FilterableField({ nullable: true })
    login!: string;

    @Expose()
    @Transform((str) => `${str.key}_transformed`)
    @IsString()
    @Field()
    password!: string;
  }

  class UpdateUserDto extends PartialType(CreateUserDto) {}

  it('should inherit all fields and set "nullable" to true', () => {
    const prototype = Object.getPrototypeOf(UpdateUserDto);
    const { fields } = getFieldsAndDecoratorForType(prototype);
    const filterableFields = getFilterableFields(UpdateUserDto);
    expect(filterableFields).toHaveLength(3);
    expect(filterableFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          propertyName: 'id',
          advancedOptions: { nullable: true },
        }),
        expect.objectContaining({
          propertyName: 'updatedAt',
          advancedOptions: { nullable: true },
        }),
        expect.objectContaining({
          propertyName: 'login',
          advancedOptions: { nullable: true },
        }),
      ]),
    );
    expect(fields).toHaveLength(5);
    expect(fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'id',
          options: { nullable: true },
        }),
        expect.objectContaining({
          name: 'createdAt',
          options: { nullable: true },
        }),
        expect.objectContaining({
          name: 'updatedAt',
          options: { nullable: true },
        }),
        expect.objectContaining({
          name: 'login',
          options: { nullable: true },
        }),
        expect.objectContaining({
          name: 'password',
          options: { nullable: true },
        }),
      ]),
    );
    expect(fields[0].directives?.length).toEqual(1);
    expect(fields[0].directives).toContainEqual({
      fieldName: 'id',
      sdl: '@upper',
      target: prototype,
    });
    expect(fields[0].extensions).toEqual({
      extension: true,
    });
  });
});
