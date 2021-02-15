// eslint-disable-next-line max-classes-per-file
import { ArgsType, Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { deepEqual, objectContaining, when } from 'ts-mockito';
import { Filter } from '@nestjs-query/core';
import {
  Authorizer,
  ConnectionType,
  CursorQueryArgsType,
  InjectAuthorizer,
  NoPagingQueryArgsType,
  OffsetQueryArgsType,
  PagingStrategies,
  QueryArgsType,
  ReadResolver,
  ReadResolverOpts,
} from '../../src';
import { expectSDL } from '../__fixtures__';
import {
  createResolverFromNest,
  readBasicResolverSDL,
  readCursorConnectionWithTotalCountSDL,
  readOffsetConnectionWithTotalCountSDL,
  readCustomConnectionResolverSDL,
  readCustomManyQueryResolverSDL,
  readCustomNameResolverSDL,
  readCustomOneQueryResolverSDL,
  readCustomQueryResolverSDL,
  readDisabledResolverSDL,
  readManyDisabledResolverSDL,
  readOffsetQueryResolverSDL,
  readOneDisabledResolverSDL,
  TestResolverDTO,
  TestService,
} from './__fixtures__';

describe('ReadResolver', () => {
  const expectResolverSDL = (sdl: string, opts?: ReadResolverOpts<TestResolverDTO>) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends ReadResolver(TestResolverDTO, opts) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }

    return expectSDL([TestSDLResolver], sdl);
  };

  it('should create a ReadResolver for the DTO', () => expectResolverSDL(readBasicResolverSDL));

  it('should use the dtoName if provided', () => expectResolverSDL(readCustomNameResolverSDL, { dtoName: 'Test' }));

  it('should use the one.name option for the findById if provided', () =>
    expectResolverSDL(readCustomOneQueryResolverSDL, { one: { name: 'read_one_test' } }));

  it('should use the many.name option for the queryMany if provided', () =>
    expectResolverSDL(readCustomManyQueryResolverSDL, { many: { name: 'read_many_test' } }));

  it('should not expose read methods if disabled', () =>
    expectResolverSDL(readDisabledResolverSDL, { disabled: true }));

  describe('query many', () => {
    it('should not create a new type if the QueryArgs is supplied', () => {
      @ArgsType()
      class CustomQueryArgs extends QueryArgsType(TestResolverDTO) {
        @Field()
        other!: string;
      }

      return expectResolverSDL(readCustomQueryResolverSDL, { QueryArgs: CustomQueryArgs });
    });

    it('should use a connection if custom QueryArgs is a cursor', () => {
      @ArgsType()
      class CustomQueryArgs extends QueryArgsType(TestResolverDTO, { pagingStrategy: PagingStrategies.CURSOR }) {}

      return expectResolverSDL(readBasicResolverSDL, { QueryArgs: CustomQueryArgs });
    });

    it('should not use a connection if pagingStrategy is OFFSET', () =>
      expectResolverSDL(readOffsetQueryResolverSDL, { pagingStrategy: PagingStrategies.OFFSET }));

    it('should not use a connection if custom QueryArgs is a limit offset', () => {
      @ArgsType()
      class CustomQueryArgs extends QueryArgsType(TestResolverDTO, { pagingStrategy: PagingStrategies.OFFSET }) {}

      return expectResolverSDL(readOffsetQueryResolverSDL, { QueryArgs: CustomQueryArgs });
    });

    it('should not expose query method if disabled', () =>
      expectResolverSDL(readManyDisabledResolverSDL, { many: { disabled: true } }));

    it('should not create a new type if the Connection is supplied', () => {
      @ObjectType()
      class CustomConnection extends ConnectionType(TestResolverDTO) {
        @Field()
        other!: string;
      }

      return expectResolverSDL(readCustomConnectionResolverSDL, { Connection: CustomConnection });
    });

    describe('#queryMany cursor connection', () => {
      @Resolver(() => TestResolverDTO)
      class TestResolver extends ReadResolver(TestResolverDTO) {
        constructor(
          service: TestService,
          @InjectAuthorizer(TestResolverDTO) readonly authorizer: Authorizer<TestResolverDTO>,
        ) {
          super(service);
        }
      }

      it('should call the service query with the provided input', async () => {
        const { resolver, mockService, mockAuthorizer } = await createResolverFromNest(TestResolver);
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
        const context = {};
        when(mockAuthorizer.authorize(context)).thenResolve({});
        when(mockService.query(objectContaining({ ...input, paging: { limit: 2, offset: 0 } }))).thenResolve(output);
        const result = await resolver.queryMany(input, context);
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

      it('should invoke the auth service for a filter for the DTO', async () => {
        const { resolver, mockService, mockAuthorizer } = await createResolverFromNest(TestResolver);
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
        const context = {};
        when(mockAuthorizer.authorize(context)).thenResolve(authorizeFilter);
        when(
          mockService.query(
            objectContaining({ filter: { ...input.filter, ...authorizeFilter }, paging: { limit: 2, offset: 0 } }),
          ),
        ).thenResolve(output);
        const result = await resolver.queryMany(input, context);
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

      it('should call the service count with the provided input', async () => {
        const { resolver, mockService, mockAuthorizer } = await createResolverFromNest(TestResolver);
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
        const context = {};
        when(mockAuthorizer.authorize(context)).thenResolve({});
        when(mockService.query(objectContaining({ ...input, paging: { limit: 2, offset: 0 } }))).thenResolve(output);
        const result = await resolver.queryMany(input, context);
        when(mockService.count(objectContaining(input.filter!))).thenResolve(10);
        return expect(result.totalCount).resolves.toBe(10);
      });

      it('should call the service count with the provided input and auth filter', async () => {
        const { resolver, mockService, mockAuthorizer } = await createResolverFromNest(TestResolver);
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
        const context = {};
        const authorizeFilter = { id: { eq: '1' } };
        when(mockAuthorizer.authorize(context)).thenResolve(authorizeFilter);
        when(
          mockService.query(
            objectContaining({ filter: { ...input.filter, ...authorizeFilter }, paging: { limit: 2, offset: 0 } }),
          ),
        ).thenResolve(output);
        const result = await resolver.queryMany(input, context);
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
        const input: NoPagingQueryArgsType<TestResolverDTO> = {
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
      constructor(
        service: TestService,
        @InjectAuthorizer(TestResolverDTO) readonly authorizer: Authorizer<TestResolverDTO>,
      ) {
        super(service);
      }
    }

    it('should not expose findById method if disabled', () =>
      expectResolverSDL(readOneDisabledResolverSDL, { one: { disabled: true } }));

    it('should call the service findById with the provided input', async () => {
      const { resolver, mockService, mockAuthorizer } = await createResolverFromNest(TestResolver);
      const input = { id: 'id-1' };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const context = {};
      when(mockAuthorizer.authorize(context)).thenResolve({});
      when(mockService.findById(input.id, deepEqual({ filter: {} }))).thenResolve(output);
      const result = await resolver.findById(input, context);
      return expect(result).toEqual(output);
    });

    it('should call the service findById with the provided input filter from the authorizer', async () => {
      const { resolver, mockService, mockAuthorizer } = await createResolverFromNest(TestResolver);
      const input = { id: 'id-1' };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const context = {};
      const authorizeFilter: Filter<TestResolverDTO> = { stringField: { eq: 'foo' } };
      when(mockAuthorizer.authorize(context)).thenResolve(authorizeFilter);
      when(mockService.findById(input.id, deepEqual({ filter: authorizeFilter }))).thenResolve(output);
      const result = await resolver.findById(input, context);
      return expect(result).toEqual(output);
    });
  });

  it('should expose totalCount on cursor connections if enableTotalCount is true', () => {
    @Resolver(() => TestResolverDTO)
    class TestTotalCountSDLResolver extends ReadResolver(TestResolverDTO, { enableTotalCount: true }) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }

    return expectSDL([TestTotalCountSDLResolver], readCursorConnectionWithTotalCountSDL);
  });

  it('should expose totalCount on offset connections if enableTotalCount is true', () => {
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

    return expectSDL([TestTotalCountSDLResolver], readOffsetConnectionWithTotalCountSDL);
  });
});
