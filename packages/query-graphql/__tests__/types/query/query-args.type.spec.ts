// eslint-disable-next-line max-classes-per-file
import { SortDirection, SortField, SortNulls } from '@nestjs-query/core';
import * as nestjsGraphql from '@nestjs/graphql';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CursorQueryArgsType, FilterableField, PagingStrategies, QueryArgsType } from '../../../src';
import {
  expectSDL,
  cursorQueryArgsTypeSDL,
  offsetQueryArgsTypeSDL,
  noPagingQueryArgsTypeSDL,
} from '../../__fixtures__';

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

  describe('cursor query args', () => {
    @nestjsGraphql.ArgsType()
    class TestCursorQuery extends QueryArgsType(TestDto) {}

    it('create a query for string fields', async () => {
      @nestjsGraphql.Resolver()
      class TestResolver {
        @nestjsGraphql.Query(() => String)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        test(@nestjsGraphql.Args() query: TestCursorQuery): string {
          return 'hello';
        }
      }
      return expectSDL([TestResolver], cursorQueryArgsTypeSDL);
    });

    it('should paging to the correct instance of paging', () => {
      const queryObj: TestCursorQuery = {
        paging: {
          first: 10,
          after: 'YXJyYXljb25uZWN0aW9uOjEw',
        },
      };
      const queryInstance = plainToClass(TestCursorQuery, queryObj);
      expect(validateSync(queryInstance)).toEqual([]);
      expect(queryInstance.paging).toBeInstanceOf(TestCursorQuery.PageType);
    });

    it('should sorting to the correct instance of sorting', () => {
      const queryObj: TestCursorQuery = {
        sorting: [{ field: 'stringField', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
      };
      const queryInstance = plainToClass(TestCursorQuery, queryObj);
      expect(validateSync(queryInstance)).toEqual([]);
      expect(queryInstance.sorting![0]).toBeInstanceOf(TestCursorQuery.SortType);
    });

    it('should make filter to the correct instance of sorting', () => {
      const queryObj: TestCursorQuery = {
        filter: {
          stringField: { eq: 'foo' },
        },
      };
      const queryInstance = plainToClass(TestCursorQuery, queryObj);
      expect(validateSync(queryInstance)).toEqual([]);
      expect(queryInstance.filter).toBeInstanceOf(TestCursorQuery.FilterType);
    });

    describe('options', () => {
      it('by default first should be set to 10 in the paging object', () => {
        QueryArgsType(TestDto);
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: { first: 10 },
          description: 'Limit or page results.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: {},
          description: 'Specify to filter the records returned.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: [],
          description: 'Specify to sort results.',
        });
      });

      it('allow specifying a defaultResultSize', () => {
        QueryArgsType(TestDto, { pagingStrategy: PagingStrategies.CURSOR, defaultResultSize: 2 });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: { first: 2 },
          description: 'Limit or page results.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: {},
          description: 'Specify to filter the records returned.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: [],
          description: 'Specify to sort results.',
        });
      });

      it('allow validate a maxResultsSize for paging.first', () => {
        const queryObj: TestCursorQuery = {
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
        const queryObj: TestCursorQuery = {
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
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: filter,
          description: 'Specify to filter the records returned.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
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
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: {},
          description: 'Specify to filter the records returned.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: sort,
          description: 'Specify to sort results.',
        });
      });
    });
  });

  describe('offset query args', () => {
    @nestjsGraphql.ArgsType()
    class TestOffsetQuery extends QueryArgsType(TestDto, { pagingStrategy: PagingStrategies.OFFSET }) {}

    it('create a query for string fields', async () => {
      @nestjsGraphql.Resolver()
      class TestResolver {
        @nestjsGraphql.Query(() => String)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        test(@nestjsGraphql.Args() query: TestOffsetQuery): string {
          return 'hello';
        }
      }
      return expectSDL([TestResolver], offsetQueryArgsTypeSDL);
    });

    it('should paging to the correct instance of paging', () => {
      const queryObj: TestOffsetQuery = {
        paging: {
          limit: 10,
          offset: 2,
        },
      };
      const queryInstance = plainToClass(TestOffsetQuery, queryObj);
      expect(validateSync(queryInstance)).toEqual([]);
      expect(queryInstance.paging).toBeInstanceOf(TestOffsetQuery.PageType);
    });

    it('should sorting to the correct instance of sorting', () => {
      const queryObj: TestOffsetQuery = {
        sorting: [{ field: 'stringField', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
      };
      const queryInstance = plainToClass(TestOffsetQuery, queryObj);
      expect(validateSync(queryInstance)).toEqual([]);
      expect(queryInstance.sorting![0]).toBeInstanceOf(TestOffsetQuery.SortType);
    });

    it('should make filter to the correct instance of sorting', () => {
      const queryObj: CursorQueryArgsType<TestDto> = {
        filter: {
          stringField: { eq: 'foo' },
        },
      };
      const queryInstance = plainToClass(TestOffsetQuery, queryObj);
      expect(validateSync(queryInstance)).toEqual([]);
      expect(queryInstance.filter).toBeInstanceOf(TestOffsetQuery.FilterType);
    });

    describe('options', () => {
      it('by default limit should be set to 10 in the paging object', () => {
        QueryArgsType(TestDto, { pagingStrategy: PagingStrategies.OFFSET });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: { limit: 10 },
          description: 'Limit or page results.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: {},
          description: 'Specify to filter the records returned.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: [],
          description: 'Specify to sort results.',
        });
      });

      it('allow specifying a defaultResultSize', () => {
        QueryArgsType(TestDto, { pagingStrategy: PagingStrategies.OFFSET, defaultResultSize: 2 });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: { limit: 2 },
          description: 'Limit or page results.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: {},
          description: 'Specify to filter the records returned.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: [],
          description: 'Specify to sort results.',
        });
      });

      it('validate a maxResultsSize for paging.limit', () => {
        const queryObj: CursorQueryArgsType<TestDto> = {
          paging: { limit: 10 },
        };
        const QT = QueryArgsType(TestDto, { pagingStrategy: PagingStrategies.OFFSET, maxResultsSize: 5 });
        const queryInstance = plainToClass(QT, queryObj);
        expect(validateSync(queryInstance)).toEqual([
          {
            children: [],
            constraints: {
              PropertyMax: 'Field paging.limit max allowed value is `5`.',
            },
            property: 'paging',
            target: queryObj,
            value: queryObj.paging,
          },
        ]);
      });

      it('allow specifying a default filter', () => {
        const filter = { booleanField: { is: true } };
        QueryArgsType(TestDto, { pagingStrategy: PagingStrategies.OFFSET, defaultFilter: filter });
        expect(fieldSpy).toHaveBeenNthCalledWith(1, expect.any(Function), {
          defaultValue: { limit: 10 },
          description: 'Limit or page results.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: filter,
          description: 'Specify to filter the records returned.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: [],
          description: 'Specify to sort results.',
        });
      });

      it('allow specifying a default sort', () => {
        const sort: SortField<TestDto>[] = [{ field: 'booleanField', direction: SortDirection.DESC }];
        QueryArgsType(TestDto, { pagingStrategy: PagingStrategies.OFFSET, defaultSort: sort });
        expect(fieldSpy).toHaveBeenNthCalledWith(1, expect.any(Function), {
          defaultValue: { limit: 10 },
          description: 'Limit or page results.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: {},
          description: 'Specify to filter the records returned.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: sort,
          description: 'Specify to sort results.',
        });
      });
    });
  });

  describe('no paging query args', () => {
    @nestjsGraphql.ArgsType()
    class TestNoPagingQuery extends QueryArgsType(TestDto, { pagingStrategy: PagingStrategies.NONE }) {}

    it('create a query for string fields', async () => {
      @nestjsGraphql.Resolver()
      class TestResolver {
        @nestjsGraphql.Query(() => String)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        test(@nestjsGraphql.Args() query: TestNoPagingQuery): string {
          return 'hello';
        }
      }
      return expectSDL([TestResolver], noPagingQueryArgsTypeSDL);
    });

    it('should sorting to the correct instance of sorting', () => {
      const queryObj: TestNoPagingQuery = {
        sorting: [{ field: 'stringField', direction: SortDirection.ASC, nulls: SortNulls.NULLS_LAST }],
      };
      const queryInstance = plainToClass(TestNoPagingQuery, queryObj);
      expect(validateSync(queryInstance)).toEqual([]);
      expect(queryInstance.sorting![0]).toBeInstanceOf(TestNoPagingQuery.SortType);
    });

    it('should make filter to the correct instance of sorting', () => {
      const queryObj: CursorQueryArgsType<TestDto> = {
        filter: {
          stringField: { eq: 'foo' },
        },
      };
      const queryInstance = plainToClass(TestNoPagingQuery, queryObj);
      expect(validateSync(queryInstance)).toEqual([]);
      expect(queryInstance.filter).toBeInstanceOf(TestNoPagingQuery.FilterType);
    });

    describe('options', () => {
      it('allow specifying a default filter', () => {
        const filter = { booleanField: { is: true } };
        QueryArgsType(TestDto, { pagingStrategy: PagingStrategies.NONE, defaultFilter: filter });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: filter,
          description: 'Specify to filter the records returned.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: [],
          description: 'Specify to sort results.',
        });
      });

      it('allow specifying a default sort', () => {
        const sort: SortField<TestDto>[] = [{ field: 'booleanField', direction: SortDirection.DESC }];
        QueryArgsType(TestDto, { pagingStrategy: PagingStrategies.NONE, defaultSort: sort });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: {},
          description: 'Specify to filter the records returned.',
        });
        expect(fieldSpy).toHaveBeenCalledWith(expect.any(Function), {
          defaultValue: sort,
          description: 'Specify to sort results.',
        });
      });
    });
  });
});
