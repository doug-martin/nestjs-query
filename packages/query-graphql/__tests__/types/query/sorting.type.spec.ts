import 'reflect-metadata';
import { ObjectType, InputType, Query, Resolver, Args, Int } from '@nestjs/graphql';
import { SortType, FilterableField } from '../../../src';
import { expectSDL, sortingInputTypeSDL } from '../../__fixtures__';

describe('SortingType', (): void => {
  @ObjectType()
  class TestSort {
    @FilterableField()
    stringField!: string;

    @FilterableField()
    numberField!: number;

    @FilterableField()
    boolField!: boolean;
  }

  it('should create the correct graphql schema for sorting type', () => {
    @InputType()
    class Sorting extends SortType(TestSort) {}

    @Resolver()
    class SortingTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: Sorting): number {
        return 1;
      }
    }
    return expectSDL([SortingTypeSpec], sortingInputTypeSDL);
  });

  it('should throw an error if the class is not annotated with @ObjectType', () => {
    class BadTestSort {}
    expect(() => SortType(BadTestSort)).toThrow(
      'Unable to make SortType. Ensure BadTestSort is annotated with @nestjs/graphql @ObjectType',
    );
  });
  it('should throw an error if no fields are found', () => {
    @ObjectType()
    class BadTestSort {}
    expect(() => SortType(BadTestSort)).toThrow(
      'No fields found to create SortType for BadTestSort. Ensure fields are annotated with @FilterableField',
    );
  });
});
