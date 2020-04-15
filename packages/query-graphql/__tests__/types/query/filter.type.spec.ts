import 'reflect-metadata';
import { Class, Filter } from '@nestjs-query/core';
import { plainToClass } from 'class-transformer';
import { ObjectType, Int, Resolver, Query, Args, Float, GraphQLTimestamp, Field, InputType } from '@nestjs/graphql';
import { FilterableField, FilterType } from '../../../src';
import { expectSDL, filterInputTypeSDL } from '../../__fixtures__';

describe('GraphQLFilterType', (): void => {
  @ObjectType('TestFilterDto')
  class TestDto {
    @FilterableField()
    boolField!: boolean;

    @FilterableField()
    dateField!: Date;

    @FilterableField(() => Float)
    floatField!: number;

    @FilterableField(() => Int)
    intField!: number;

    @FilterableField()
    numberField!: number;

    @FilterableField()
    stringField!: string;

    @FilterableField(() => GraphQLTimestamp)
    timestampField!: Date;

    @Field()
    nonFilterField!: number;
  }
  const TestGraphQLFilter: Class<Filter<TestDto>> = FilterType(TestDto);
  @InputType()
  class TestDtoFilter extends TestGraphQLFilter {}

  it('should throw an error if the class is not annotated with @ObjectType', () => {
    class TestInvalidFilter {}

    expect(() => FilterType(TestInvalidFilter)).toThrow(
      'No fields found to create FilterType. Ensure TestInvalidFilter is annotated with @nestjs/graphql @ObjectType',
    );
  });

  it('should create the correct filter graphql schema', () => {
    @Resolver()
    class FilterTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: TestDtoFilter): number {
        return 1;
      }
    }
    return expectSDL([FilterTypeSpec], filterInputTypeSDL);
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
