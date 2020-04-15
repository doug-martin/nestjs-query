import 'reflect-metadata';
import { SortDirection, SortField, SortNulls } from '@nestjs-query/core';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import * as nestjsGraphql from '@nestjs/graphql';
import { QueryArgsType, FilterableField } from '../../../src';
import { expectSDL, queryArgsTypeSDL } from '../../__fixtures__';

describe('QueryType', (): void => {
  const fieldSpy = jest.spyOn(nestjsGraphql, 'Field');
  afterEach(() => jest.clearAllMocks());

  @nestjsGraphql.ObjectType('TestQuery')
  class TestDto {
    @FilterableField(() => nestjsGraphql.ID)
    idField!: number;

    @FilterableField(() => nestjsGraphql.ID, { nullable: true })
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

    @FilterableField(() => nestjsGraphql.Float)
    floatField!: number;

    @FilterableField(() => nestjsGraphql.Float, { nullable: true })
    floatFieldOptional?: number;

    @FilterableField(() => nestjsGraphql.Int)
    intField!: number;

    @FilterableField(() => nestjsGraphql.Int, { nullable: true })
    intFieldOptional?: number;

    @FilterableField(() => nestjsGraphql.GraphQLTimestamp)
    timestampField!: Date;

    @FilterableField(() => nestjsGraphql.GraphQLTimestamp, { nullable: true })
    timestampFieldOptional?: Date;

    @FilterableField(() => nestjsGraphql.GraphQLISODateTime)
    date!: Date;

    @FilterableField(() => nestjsGraphql.GraphQLISODateTime, { nullable: true })
    dateOptional?: Date;
  }

  // @ts-ignore
  @nestjsGraphql.ArgsType()
  class TestQuery extends QueryArgsType(TestDto) {}

  it('create a query for string fields', async () => {
    @nestjsGraphql.Resolver()
    class TestResolver {
      @nestjsGraphql.Query(() => String)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@nestjsGraphql.Args() query: TestQuery): string {
        return 'hello';
      }
    }
    return expectSDL([TestResolver], queryArgsTypeSDL);
  });

  it('should paging to the correct instance of paging', () => {
    const queryObj: QueryArgsType<TestDto> = {
      paging: {
        first: 10,
        after: 'YXJyYXljb25uZWN0aW9uOjEw',
      },
    };
    const queryInstance = plainToClass(TestQuery, queryObj);
    expect(validateSync(queryInstance)).toEqual([]);
    expect(queryInstance.paging).toBeInstanceOf(TestQuery.PageType);
  });

  it('should sorting to the correct instance of sorting', () => {
    const queryObj: QueryArgsType<TestDto> = {
      sorting: [{ field: 'stringField', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
    };
    const queryInstance = plainToClass(TestQuery, queryObj);
    expect(validateSync(queryInstance)).toEqual([]);
    expect(queryInstance.sorting![0]).toBeInstanceOf(TestQuery.SortType);
  });

  it('should make filter to the correct instance of sorting', () => {
    const queryObj: QueryArgsType<TestDto> = {
      filter: {
        stringField: { eq: 'foo' },
      },
    };
    const queryInstance = plainToClass(TestQuery, queryObj);
    expect(validateSync(queryInstance)).toEqual([]);
    expect(queryInstance.filter).toBeInstanceOf(TestQuery.FilterType);
  });

  describe('options', () => {
    it('by default first should be set to 10 in the paging object', () => {
      QueryArgsType(TestDto);
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: { first: 10 },
        description: 'Limit or page results.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: {},
        description: 'Specify to filter the records returned.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: [],
        description: 'Specify to sort results.',
      });
    });

    it('allow specifying a defaultResultSize', () => {
      QueryArgsType(TestDto, { defaultResultSize: 2 });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: { first: 2 },
        description: 'Limit or page results.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: {},
        description: 'Specify to filter the records returned.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: [],
        description: 'Specify to sort results.',
      });
    });

    it('allow validate a maxResultsSize for paging.first', () => {
      const queryObj: QueryArgsType<TestDto> = {
        paging: { first: 10 },
      };
      const QT = QueryArgsType(TestDto, { maxResultsSize: 5 });
      const queryInstance = plainToClass(QT, queryObj);
      expect(validateSync(queryInstance)).toEqual([
        {
          children: [],
          constraints: {
            PropertyMax: 'Field paging.first max allowed value is `5`.',
          },
          property: 'paging',
          target: queryObj,
          value: queryObj.paging,
        },
      ]);
    });

    it('allow validate a maxResultsSize for paging.last', () => {
      const queryObj: QueryArgsType<TestDto> = {
        paging: { last: 10, before: 'abc' },
      };
      const QT = QueryArgsType(TestDto, { maxResultsSize: 5 });
      const queryInstance = plainToClass(QT, queryObj);
      expect(validateSync(queryInstance)).toEqual([
        {
          children: [],
          constraints: {
            PropertyMax: 'Field paging.last max allowed value is `5`.',
          },
          property: 'paging',
          target: queryObj,
          value: queryObj.paging,
        },
      ]);
    });

    it('allow specifying a default filter', () => {
      const filter = { booleanField: { is: true } };
      QueryArgsType(TestDto, { defaultFilter: filter });
      expect(fieldSpy).toHaveBeenNthCalledWith(1, expect.any(Function), {
        defaultValue: { first: 10 },
        description: 'Limit or page results.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: filter,
        description: 'Specify to filter the records returned.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: [],
        description: 'Specify to sort results.',
      });
    });

    it('allow specifying a default sort', () => {
      const sort: SortField<TestDto>[] = [{ field: 'booleanField', direction: SortDirection.DESC }];
      QueryArgsType(TestDto, { defaultSort: sort });
      expect(fieldSpy).toHaveBeenNthCalledWith(1, expect.any(Function), {
        defaultValue: { first: 10 },
        description: 'Limit or page results.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: {},
        description: 'Specify to filter the records returned.',
      });
      expect(fieldSpy).toBeCalledWith(expect.any(Function), {
        defaultValue: sort,
        description: 'Specify to sort results.',
      });
    });
  });
});
