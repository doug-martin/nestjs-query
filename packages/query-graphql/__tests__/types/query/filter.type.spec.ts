// eslint-disable-next-line max-classes-per-file
import { Class, Filter } from '@nestjs-query/core';
import { plainToClass } from 'class-transformer';
import {
  ObjectType,
  Int,
  Resolver,
  Query,
  Args,
  Float,
  GraphQLTimestamp,
  Field,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  FilterableField,
  FilterType,
  Relation,
  FilterableRelation,
  Connection,
  FilterableConnection,
  UpdateFilterType,
  DeleteFilterType,
  SubscriptionFilterType,
} from '../../../src';
import {
  expectSDL,
  filterInputTypeSDL,
  updateFilterInputTypeSDL,
  deleteFilterInputTypeSDL,
  subscriptionFilterInputTypeSDL,
} from '../../__fixtures__';

describe('filter types', (): void => {
  enum NumberEnum {
    ONE,
    TWO,
    THREE,
    FOUR,
  }

  enum StringEnum {
    ONE_STR = 'one',
    TWO_STR = 'two',
    THREE_STR = 'three',
    FOUR_STR = 'four',
  }

  registerEnumType(StringEnum, {
    name: 'StringEnum',
  });

  registerEnumType(NumberEnum, {
    name: 'NumberEnum',
  });

  @ObjectType({ isAbstract: true })
  class BaseType {
    @FilterableField()
    id!: number;
  }

  @ObjectType('TestRelationDto')
  class TestRelation extends BaseType {
    @FilterableField()
    relationName!: string;

    @FilterableField()
    relationAge!: number;
  }

  @ObjectType('TestFilterDto')
  @Relation('unfilterableRelation', () => TestRelation)
  @FilterableRelation('filterableRelation', () => TestRelation)
  @FilterableRelation('filterableRelations', () => [TestRelation])
  @Connection('unfilterableConnection', () => TestRelation)
  @FilterableConnection('filterableConnection', () => TestRelation)
  class TestDto extends BaseType {
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

    @FilterableField(() => StringEnum)
    stringEnumField!: StringEnum;

    @FilterableField(() => NumberEnum)
    numberEnumField!: NumberEnum;

    @FilterableField(() => GraphQLTimestamp)
    timestampField!: Date;

    @Field()
    nonFilterField!: number;
  }

  describe('FilterType', () => {
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
      @ObjectType('TestNoFields')
      class TestInvalidFilter {}

      expect(() => FilterType(TestInvalidFilter)).toThrow(
        'No fields found to create GraphQLFilter for TestInvalidFilter',
      );
    });

    it('should throw an error when the field type is unknown', () => {
      enum EnumField {
        ONE = 'one',
      }
      @ObjectType('TestBadField')
      class TestInvalidFilter {
        @FilterableField(() => EnumField)
        fakeType!: EnumField;
      }

      expect(() => FilterType(TestInvalidFilter)).toThrow('Unable to create filter comparison for {"ONE":"one"}.');
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

  describe('UpdateFilterType', () => {
    const TestGraphQLFilter: Class<Filter<TestDto>> = UpdateFilterType(TestDto);

    @InputType()
    class TestDtoFilter extends TestGraphQLFilter {}

    it('should throw an error if the class is not annotated with @ObjectType', () => {
      class TestInvalidFilter {}

      expect(() => UpdateFilterType(TestInvalidFilter)).toThrow(
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
      return expectSDL([FilterTypeSpec], updateFilterInputTypeSDL);
    });

    it('should throw an error if no fields are found', () => {
      @ObjectType('TestNoFields')
      class TestInvalidFilter {}

      expect(() => UpdateFilterType(TestInvalidFilter)).toThrow(
        'No fields found to create GraphQLFilter for TestInvalidFilter',
      );
    });

    it('should throw an error when the field type is unknown', () => {
      enum EnumField {
        ONE = 'one',
      }
      @ObjectType('TestBadField')
      class TestInvalidFilter {
        @FilterableField(() => EnumField)
        fakeType!: EnumField;
      }

      expect(() => UpdateFilterType(TestInvalidFilter)).toThrow(
        'Unable to create filter comparison for {"ONE":"one"}.',
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

  describe('DeleteFilterType', () => {
    const TestGraphQLFilter: Class<Filter<TestDto>> = DeleteFilterType(TestDto);

    @InputType()
    class TestDtoFilter extends TestGraphQLFilter {}

    it('should throw an error if the class is not annotated with @ObjectType', () => {
      class TestInvalidFilter {}

      expect(() => DeleteFilterType(TestInvalidFilter)).toThrow(
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
      return expectSDL([FilterTypeSpec], deleteFilterInputTypeSDL);
    });

    it('should throw an error if no fields are found', () => {
      @ObjectType('TestNoFields')
      class TestInvalidFilter {}

      expect(() => DeleteFilterType(TestInvalidFilter)).toThrow(
        'No fields found to create GraphQLFilter for TestInvalidFilter',
      );
    });

    it('should throw an error when the field type is unknown', () => {
      enum EnumField {
        ONE = 'one',
      }
      @ObjectType('TestBadField')
      class TestInvalidFilter {
        @FilterableField(() => EnumField)
        fakeType!: EnumField;
      }

      expect(() => DeleteFilterType(TestInvalidFilter)).toThrow(
        'Unable to create filter comparison for {"ONE":"one"}.',
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

  describe('SubscriptionFilterType', () => {
    const TestGraphQLFilter: Class<Filter<TestDto>> = SubscriptionFilterType(TestDto);

    @InputType()
    class TestDtoFilter extends TestGraphQLFilter {}

    it('should throw an error if the class is not annotated with @ObjectType', () => {
      class TestInvalidFilter {}

      expect(() => SubscriptionFilterType(TestInvalidFilter)).toThrow(
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
      return expectSDL([FilterTypeSpec], subscriptionFilterInputTypeSDL);
    });

    it('should throw an error if no fields are found', () => {
      @ObjectType('TestNoFields')
      class TestInvalidFilter {}

      expect(() => SubscriptionFilterType(TestInvalidFilter)).toThrow(
        'No fields found to create GraphQLFilter for TestInvalidFilter',
      );
    });

    it('should throw an error when the field type is unknown', () => {
      enum EnumField {
        ONE = 'one',
      }
      @ObjectType('TestBadField')
      class TestInvalidFilter {
        @FilterableField(() => EnumField)
        fakeType!: EnumField;
      }

      expect(() => SubscriptionFilterType(TestInvalidFilter)).toThrow(
        'Unable to create filter comparison for {"ONE":"one"}.',
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
});
