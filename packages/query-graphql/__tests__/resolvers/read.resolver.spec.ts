// eslint-disable-next-line max-classes-per-file
import { ArgsType, Field, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { objectContaining, when } from 'ts-mockito';
import {
  ConnectionType,
  CursorQueryArgsType,
  LimitOffsetQueryArgsType,
  PagingStrategies,
  QueryArgsType,
  ReadResolver,
  ReadResolverOpts,
} from '../../src';
import { expectSDL } from '../__fixtures__';
import {
  createResolverFromNest,
  readBasicResolverSDL,
  readCustomConnectionResolverSDL,
  readCustomNameResolverSDL,
  readCustomQueryResolverSDL,
  readDisabledResolverSDL,
  readLimitOffsetQueryResolverSDL,
  readManyDisabledResolverSDL,
  readOneDisabledResolverSDL,
  TestResolverDTO,
  TestService,
} from './__fixtures__';

@Resolver(() => TestResolverDTO)
class TestResolver extends ReadResolver(TestResolverDTO) {
  constructor(service: TestService) {
    super(service);
  }
}

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

    it('should not use a connection if pagingStrategy is LIMIT_OFFSET', () => {
      return expectResolverSDL(readLimitOffsetQueryResolverSDL, { pagingStrategy: PagingStrategies.LIMIT_OFFSET });
    });

    it('should not use a connection if custom QueryArgs is a limit offset', () => {
      @ArgsType()
      class CustomQueryArgs extends QueryArgsType(TestResolverDTO, { pagingStrategy: PagingStrategies.LIMIT_OFFSET }) {}

      return expectResolverSDL(readLimitOffsetQueryResolverSDL, { QueryArgs: CustomQueryArgs });
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

    describe('#queryManyConnection', () => {
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
        const result = await resolver.queryManyConnection(input);
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
        });
      });
    });

    describe('#queryMany', () => {
      it('should call the service query with the provided input', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const input: LimitOffsetQueryArgsType<TestResolverDTO> = {
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
  });

  describe('#findById', () => {
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
});
