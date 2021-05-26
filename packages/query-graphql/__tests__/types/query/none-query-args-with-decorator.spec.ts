// eslint-disable-next-line max-classes-per-file
import { SortDirection } from '@nestjs-query/core';
import {
  Args,
  ArgsType,
  Float,
  GraphQLISODateTime,
  GraphQLTimestamp,
  ID,
  Int,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { FilterableField, PagingStrategies, QueryArgsType, QueryOptions } from '../../../src';
import { generateSchema } from '../../__fixtures__';

describe('QueryArgsType with decorator options', (): void => {
  afterEach(() => jest.clearAllMocks());

  @ObjectType('NoPagingQueryOptionsDTO')
  @QueryOptions({
    pagingStrategy: PagingStrategies.NONE,
    defaultResultSize: 2,
    maxResultsSize: 5,
    defaultFilter: { booleanField: { is: true } },
    defaultSort: [{ field: 'booleanField', direction: SortDirection.DESC }],
  })
  class TestDto {
    @FilterableField(() => ID)
    idField!: number;

    @FilterableField(() => ID, { nullable: true })
    idFieldOption?: number;

    @FilterableField()
    stringField!: string;

    @FilterableField({ nullable: true })
    stringFieldOptional?: string;

    @FilterableField()
    booleanField!: boolean;

    @FilterableField({ nullable: true })
    booleanFieldOptional?: boolean;

    @FilterableField()
    numberField!: number;

    @FilterableField({ nullable: true })
    numberFieldOptional?: number;

    @FilterableField(() => Float)
    floatField!: number;

    @FilterableField(() => Float, { nullable: true })
    floatFieldOptional?: number;

    @FilterableField(() => Int)
    intField!: number;

    @FilterableField(() => Int, { nullable: true })
    intFieldOptional?: number;

    @FilterableField(() => GraphQLTimestamp)
    timestampField!: Date;

    @FilterableField(() => GraphQLTimestamp, { nullable: true })
    timestampFieldOptional?: Date;

    @FilterableField(() => GraphQLISODateTime)
    date!: Date;

    @FilterableField(() => GraphQLISODateTime, { nullable: true })
    dateOptional?: Date;
  }

  describe('no paging query args', () => {
    describe('options', () => {
      @ArgsType()
      class NoPagingQueryOptionsArgs extends QueryArgsType(TestDto) {}

      it('allow apply the options to the generated SDL', async () => {
        @Resolver()
        class TestNoPagingQueryOptionsDecoratorResolver {
          @Query(() => String)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          test(@Args() query: NoPagingQueryOptionsArgs): string {
            return 'hello';
          }
        }
        const schema = await generateSchema([TestNoPagingQueryOptionsDecoratorResolver]);
        expect(schema).toMatchSnapshot();
      });
    });
  });
});
