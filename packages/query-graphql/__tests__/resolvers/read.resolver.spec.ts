// eslint-disable-next-line max-classes-per-file
import { ArgsType, Field, Query, Resolver } from '@nestjs/graphql';
import { deepEqual, objectContaining, when } from 'ts-mockito';
import { Filter } from '@nestjs-query/core';
import {
  CursorQueryArgsType,
  NonePagingQueryArgsType,
  OffsetQueryArgsType,
  PagingStrategies,
  QueryArgsType,
  ReadResolver,
  ReadResolverOpts,
} from '../../src';
import { createResolverFromNest, TestResolverDTO, TestService, generateSchema } from '../__fixtures__';

describe('ReadResolver', () => {
  const expectResolverSDL = async (opts?: ReadResolverOpts<TestResolverDTO>) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends ReadResolver(TestResolverDTO, opts) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }

    const schema = await generateSchema([TestSDLResolver]);
    expect(schema).toMatchSnapshot();
  };

  it('should create a ReadResolver for the DTO', () => expectResolverSDL());

  it('should use the dtoName if provided', () => expectResolverSDL({ dtoName: 'Test' }));

  it('should use the one.name option for the findById if provided', () =>
    expectResolverSDL({ one: { name: 'read_one_test' } }));

  it('should use the many.name option for the queryMany if provided', () =>
    expectResolverSDL({ many: { name: 'read_many_test' } }));

  it('should not expose read methods if disabled', () => expectResolverSDL({ disabled: true }));

  describe('query many', () => {
    it('should not create a new type if the QueryArgs is supplied', () => {
      @ArgsType()
      class CustomQueryArgs extends QueryArgsType(TestResolverDTO) {
        @Field()
        other!: string;
      }

      return expectResolverSDL({ QueryArgs: CustomQueryArgs });
    });

    it('should use a connection if custom QueryArgs is a cursor', () => {
      @ArgsType()
      class CustomQueryArgs extends QueryArgsType(TestResolverDTO, { pagingStrategy: PagingStrategies.CURSOR }) {}

      return expectResolverSDL({ QueryArgs: CustomQueryArgs });
    });

    it('should not use a connection if pagingStrategy is OFFSET', () =>
      expectResolverSDL({ pagingStrategy: PagingStrategies.OFFSET }));

    it('should use an offset connection if custom QueryArgs is a limit offset', () => {
      @ArgsType()
      class CustomQueryArgs extends QueryArgsType(TestResolverDTO, {
        pagingStrategy: PagingStrategies.OFFSET,
        connectionName: 'TestResolverDTOConnection',
      }) {}

      return expectResolverSDL({ QueryArgs: CustomQueryArgs });
    });

    it('should not expose query method if disabled', () => expectResolverSDL({ many: { disabled: true } }));

    describe('#queryMany cursor connection', () => {
      @Resolver(() => TestResolverDTO)
      class TestResolver extends ReadResolver(TestResolverDTO) {
        constructor(service: TestService) {
          super(service);
        }
      }

      it('should call the service query with the provided input', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const input: CursorQueryArgsType<TestResolverDTO> = {
          filter: {
            stringField: { eq: 'foo' },
          },
          paging: { first: 1 },
        };
        const output: TestResolverDTO[] = [
          {
            id: 'id-1',
            stringField: 'foo',
          },
        ];
        when(mockService.query(objectContaining({ ...input, paging: { limit: 2, offset: 0 } }))).thenResolve(output);
        const result = await resolver.queryMany(input);
        return expect(result).toEqual({
          edges: [
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
              node: {
                id: 'id-1',
                stringField: 'foo',
              },
            },
          ],
          pageInfo: {
            endCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          },
          totalCountFn: expect.any(Function),
        });
      });

      it('should merge the filter an auth filter if provided', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const input: CursorQueryArgsType<TestResolverDTO> = {
          filter: {
            stringField: { eq: 'foo' },
          },
          paging: { first: 1 },
        };
        const output: TestResolverDTO[] = [
          {
            id: 'id-1',
            stringField: 'foo',
          },
        ];
        const authorizeFilter = { id: { eq: '1' } };
        when(
          mockService.query(
            objectContaining({ filter: { ...input.filter, ...authorizeFilter }, paging: { limit: 2, offset: 0 } }),
          ),
        ).thenResolve(output);
        const result = await resolver.queryMany(input, authorizeFilter);
        return expect(result).toEqual({
          edges: [
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
              node: {
                id: 'id-1',
                stringField: 'foo',
              },
            },
          ],
          pageInfo: {
            endCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          },
          totalCountFn: expect.any(Function),
        });
      });

      it('should call the service count', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const input: CursorQueryArgsType<TestResolverDTO> = {
          filter: {
            stringField: { eq: 'foo' },
          },
          paging: { first: 1 },
        };
        const output: TestResolverDTO[] = [
          {
            id: 'id-1',
            stringField: 'foo',
          },
        ];
        when(mockService.query(objectContaining({ ...input, paging: { limit: 2, offset: 0 } }))).thenResolve(output);
        const result = await resolver.queryMany(input);
        when(mockService.count(objectContaining(input.filter!))).thenResolve(10);
        return expect(result.totalCount).resolves.toBe(10);
      });

      it('should call the service count with the provided input and auth filter', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const input: CursorQueryArgsType<TestResolverDTO> = {
          filter: {
            stringField: { eq: 'foo' },
          },
          paging: { first: 1 },
        };
        const output: TestResolverDTO[] = [
          {
            id: 'id-1',
            stringField: 'foo',
          },
        ];
        const authorizeFilter = { id: { eq: '1' } };
        when(
          mockService.query(
            objectContaining({ filter: { ...input.filter, ...authorizeFilter }, paging: { limit: 2, offset: 0 } }),
          ),
        ).thenResolve(output);
        const result = await resolver.queryMany(input, authorizeFilter);
        when(mockService.count(objectContaining({ ...input.filter!, ...authorizeFilter }))).thenResolve(10);
        return expect(result.totalCount).resolves.toBe(10);
      });
    });

    describe('queryMany array connection', () => {
      @Resolver(() => TestResolverDTO)
      class TestResolver extends ReadResolver(TestResolverDTO, { pagingStrategy: PagingStrategies.OFFSET }) {
        constructor(service: TestService) {
          super(service);
        }
      }

      it('should call the service query with the provided input', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const input: OffsetQueryArgsType<TestResolverDTO> = {
          filter: {
            stringField: { eq: 'foo' },
          },
          paging: { limit: 1 },
        };
        const output: TestResolverDTO[] = [
          {
            id: 'id-1',
            stringField: 'foo',
          },
        ];
        when(mockService.query(objectContaining({ ...input, paging: { limit: 2 } }))).thenResolve(output);
        const result = await resolver.queryMany(input);
        return expect(result).toEqual({
          nodes: output,
          pageInfo: { hasNextPage: false, hasPreviousPage: false },
          totalCountFn: expect.any(Function),
        });
      });
    });

    describe('queryMany no paging connection', () => {
      @Resolver(() => TestResolverDTO)
      class TestResolver extends ReadResolver(TestResolverDTO, { pagingStrategy: PagingStrategies.NONE }) {
        constructor(service: TestService) {
          super(service);
        }
      }

      it('should call the service query with the provided input', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const input: NonePagingQueryArgsType<TestResolverDTO> = {
          filter: {
            stringField: { eq: 'foo' },
          },
        };
        const output: TestResolverDTO[] = [
          {
            id: 'id-1',
            stringField: 'foo',
          },
        ];
        when(mockService.query(objectContaining(input))).thenResolve(output);
        const result = await resolver.queryMany(input);
        return expect(result).toEqual(output);
      });
    });
  });

  describe('#findById', () => {
    @Resolver(() => TestResolverDTO)
    class TestResolver extends ReadResolver(TestResolverDTO) {
      constructor(service: TestService) {
        super(service);
      }
    }

    it('should not expose findById method if disabled', () => expectResolverSDL({ one: { disabled: true } }));

    it('should call the service findById with the provided input', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const input = { id: 'id-1' };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const context = {};
      when(mockService.findById(input.id, deepEqual({ filter: {} }))).thenResolve(output);
      const result = await resolver.findById(input, context);
      return expect(result).toEqual(output);
    });

    it('should call the service findById with the provided input filter and authFilter', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const input = { id: 'id-1' };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const authorizeFilter: Filter<TestResolverDTO> = { stringField: { eq: 'foo' } };
      when(mockService.findById(input.id, deepEqual({ filter: authorizeFilter }))).thenResolve(output);
      const result = await resolver.findById(input, authorizeFilter);
      return expect(result).toEqual(output);
    });
  });

  it('should expose totalCount on cursor connections if enableTotalCount is true', async () => {
    @Resolver(() => TestResolverDTO)
    class TestTotalCountSDLResolver extends ReadResolver(TestResolverDTO, { enableTotalCount: true }) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }
    const schema = await generateSchema([TestTotalCountSDLResolver]);
    expect(schema).toMatchSnapshot();
  });

  it('should expose totalCount on offset connections if enableTotalCount is true', async () => {
    @Resolver(() => TestResolverDTO)
    class TestTotalCountSDLResolver extends ReadResolver(TestResolverDTO, {
      pagingStrategy: PagingStrategies.OFFSET,
      enableTotalCount: true,
    }) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }
    const schema = await generateSchema([TestTotalCountSDLResolver]);
    expect(schema).toMatchSnapshot();
  });
});
