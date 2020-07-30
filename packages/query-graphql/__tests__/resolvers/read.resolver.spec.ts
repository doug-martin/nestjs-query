// eslint-disable-next-line max-classes-per-file
import { ArgsType, Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { objectContaining, when } from 'ts-mockito';
import {
  ConnectionType,
  CursorQueryArgsType,
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
  readConnectionWithTotalCountSDL,
  readCustomConnectionResolverSDL,
  readCustomNameResolverSDL,
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

  it('should create a ReadResolver for the DTO', () => {
    return expectResolverSDL(readBasicResolverSDL);
  });

  it('should use the dtoName if provided', () => {
    return expectResolverSDL(readCustomNameResolverSDL, { dtoName: 'Test' });
  });

  it('should not expose read methods if disabled', () => {
    return expectResolverSDL(readDisabledResolverSDL, { disabled: true });
  });

  describe('query many ', () => {
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

    it('should not use a connection if pagingStrategy is OFFSET', () => {
      return expectResolverSDL(readOffsetQueryResolverSDL, { pagingStrategy: PagingStrategies.OFFSET });
    });

    it('should not use a connection if custom QueryArgs is a limit offset', () => {
      @ArgsType()
      class CustomQueryArgs extends QueryArgsType(TestResolverDTO, { pagingStrategy: PagingStrategies.OFFSET }) {}

      return expectResolverSDL(readOffsetQueryResolverSDL, { QueryArgs: CustomQueryArgs });
    });

    it('should not expose query method if disabled', () => {
      return expectResolverSDL(readManyDisabledResolverSDL, { many: { disabled: true } });
    });

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

      it('should call the service count with the provided input', async () => {
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

      it('should do paging with offset', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const input: CursorQueryArgsType<TestResolverDTO> = {
          filter: {
            stringField: { eq: 'foo' },
          },
          paging: { first: 1, offset: 1 },
        };
        const output: TestResolverDTO[] = [
          {
            id: 'id-1',
            stringField: 'foo',
          },
        ];
        when(mockService.query(objectContaining({ ...input, paging: { limit: 2, offset: 1 } }))).thenResolve(output);
        const result = await resolver.queryMany(input);
        return expect(result).toEqual({
          edges: [
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjE=',
              node: {
                id: 'id-1',
                stringField: 'foo',
              },
            },
          ],
          pageInfo: {
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
          },
          totalCountFn: expect.any(Function),
        });
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
        when(mockService.query(objectContaining(input))).thenResolve(output);
        const result = await resolver.queryMany(input);
        return expect(result).toEqual(output);
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
      constructor(service: TestService) {
        super(service);
      }
    }
    it('should not expose findById method if disabled', () => {
      return expectResolverSDL(readOneDisabledResolverSDL, { one: { disabled: true } });
    });
    it('should call the service findById with the provided input', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const input = 'id-1';
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      when(mockService.findById(input)).thenResolve(output);
      const result = await resolver.findById(input);
      return expect(result).toEqual(output);
    });
  });

  it('should expose totalCount on connections if enableTotalCount is true ', () => {
    @ObjectType('TotalCountDTO')
    class TotalCountDTO extends TestResolverDTO {}
    @Resolver(() => TotalCountDTO)
    class TestTotalCountSDLResolver extends ReadResolver(TotalCountDTO, { enableTotalCount: true }) {
      @Query(() => TotalCountDTO)
      test(): TotalCountDTO {
        return { id: '1', stringField: 'foo' };
      }
    }

    return expectSDL([TestTotalCountSDLResolver], readConnectionWithTotalCountSDL);
  });
});
