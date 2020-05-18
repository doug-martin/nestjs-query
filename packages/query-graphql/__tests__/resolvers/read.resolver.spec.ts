import 'reflect-metadata';
import { when, objectContaining } from 'ts-mockito';
import { Resolver, ArgsType, Field, ObjectType, Query } from '@nestjs/graphql';
import { ConnectionType, QueryArgsType, ReadResolver, ReadResolverOpts } from '../../src';
import { expectSDL } from '../__fixtures__';
import {
  readBasicResolverSDL,
  readCustomConnectionResolverSDL,
  readCustomNameResolverSDL,
  readCustomQueryResolverSDL,
  readDisabledResolverSDL,
  readManyDisabledResolverSDL,
  readOneDisabledResolverSDL,
  createResolverFromNest,
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

  describe('#query', () => {
    it('should not create a new type if the QueryArgs is supplied', () => {
      @ArgsType()
      class CustomQueryArgs extends QueryArgsType(TestResolverDTO) {
        @Field()
        other!: string;
      }
      return expectResolverSDL(readCustomQueryResolverSDL, { QueryArgs: CustomQueryArgs });
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

    it('should call the service query with the provided input', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const input: QueryArgsType<TestResolverDTO> = {
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
