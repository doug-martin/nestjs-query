// eslint-disable-next-line max-classes-per-file
import { ObjectType, InputType, Query, Resolver, Args, Int } from '@nestjs/graphql';
import { FilterableField } from '../../../src';
import { getOrCreateSortType } from '../../../src/types/query/sorting.type';
import { generateSchema } from '../../__fixtures__';

describe('SortingType', (): void => {
  @ObjectType({ isAbstract: true })
  class BaseType {
    @FilterableField()
    id!: number;
  }

  @ObjectType()
  class TestSort extends BaseType {
    @FilterableField()
    stringField!: string;

    @FilterableField()
    numberField!: number;

    @FilterableField()
    boolField!: boolean;
  }

  it('should create the correct graphql schema for sorting type', async () => {
    @InputType()
    class Sorting extends getOrCreateSortType(TestSort) {}

    @Resolver()
    class SortingTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: Sorting): number {
        return 1;
      }
    }
    const schema = await generateSchema([SortingTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should throw an error if the class is not annotated with @ObjectType', () => {
    class BadTestSort {}
    expect(() => getOrCreateSortType(BadTestSort)).toThrow(
      'Unable to make SortType. Ensure BadTestSort is annotated with @nestjs/graphql @ObjectType',
    );
  });
  it('should throw an error if no fields are found', () => {
    @ObjectType()
    class BadTestSort {}
    expect(() => getOrCreateSortType(BadTestSort)).toThrow(
      'No fields found to create SortType for BadTestSort. Ensure fields are annotated with @FilterableField',
    );
  });
});
