import 'reflect-metadata';
import { Class, Filter } from '@nestjs-query/core';
import { plainToClass } from 'class-transformer';
import { ObjectType } from 'type-graphql';
import { FilterableField, FilterType } from '../../../src';

describe('GraphQLFilterType', (): void => {
  @ObjectType('TestFilterDto')
  class TestDto {
    @FilterableField()
    stringField!: string;
  }
  const TestGraphQLFilter: Class<Filter<TestDto>> = FilterType(TestDto);
  class TestDtoFilter extends TestGraphQLFilter {}

  it('should throw an error if the class is not annotated with @ObjectType', () => {
    class TestInvalidFilter {}

    expect(() => FilterType(TestInvalidFilter)).toThrow(
      'No fields found to create FilterType. Ensure TestInvalidFilter is annotated with type-graphql @ObjectType',
    );
  });

  it('should throw an error if no fields are found', () => {
    @ObjectType()
    class TestInvalidFilter {}

    expect(() => FilterType(TestInvalidFilter)).toThrow(
      'No fields found to create GraphQLFilter for TestInvalidFilter',
    );
  });

  it('should convert and filters to filter class', () => {
    const filterObject: Filter<TestDto> = {
      and: [{ stringField: { eq: 'foo' } }],
    };
    const filterInstance = plainToClass(TestDtoFilter, filterObject);
    expect(filterInstance.and![0]).toBeInstanceOf(TestGraphQLFilter);
  });

  it('should convert or filters to filter class', () => {
    const filterObject: Filter<TestDto> = {
      or: [{ stringField: { eq: 'foo' } }],
    };
    const filterInstance = plainToClass(TestDtoFilter, filterObject);
    expect(filterInstance.or![0]).toBeInstanceOf(TestGraphQLFilter);
  });
});
