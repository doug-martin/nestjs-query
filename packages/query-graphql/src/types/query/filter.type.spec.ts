import 'reflect-metadata';
import { Filter } from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { ObjectType } from 'type-graphql';
import { FilterableField } from '../../decorators';
import { GraphQLFilterType } from './filter.type';

describe('GraphQLFilterType', (): void => {
  @ObjectType('TestFilterDto')
  class TestDto {
    @FilterableField()
    stringField: string;
  }
  const TestGraphQLFilter: Type<Filter<TestDto>> = GraphQLFilterType(TestDto);
  class TestDtoFilter extends TestGraphQLFilter {}

  it('should throw an error if the class is not annotated with @ObjectType', () => {
    class TestInvalidFilter {}

    expect(() => GraphQLFilterType(TestInvalidFilter)).toThrow(
      'unable to make filter for class not registered with type-graphql TestInvalidFilter',
    );
  });

  it('should throw an error if no fields are found', () => {
    @ObjectType()
    class TestInvalidFilter {}

    expect(() => GraphQLFilterType(TestInvalidFilter)).toThrow(
      'No fields found to create GraphQLFilter for TestInvalidFilter',
    );
  });

  it('should convert and filters to filter class', () => {
    const filterObject: Filter<TestDto> = {
      and: [{ stringType: { eq: 'foo' } }],
    };
    const filterInstance = plainToClass(TestDtoFilter, filterObject);
    expect(filterInstance.and![0]).toBeInstanceOf(TestGraphQLFilter);
  });

  it('should convert or filters to filter class', () => {
    const filterObject: Filter<TestDto> = {
      or: [{ stringType: { eq: 'foo' } }],
    };
    const filterInstance = plainToClass(TestDtoFilter, filterObject);
    expect(filterInstance.or![0]).toBeInstanceOf(TestGraphQLFilter);
  });
});
