import { Query, Resolver } from '@nestjs/graphql';
import { deepEqual, objectContaining, when } from 'ts-mockito';
import { FederationResolver, RelationsOpts } from '../../../src/resolvers';
import { CursorQueryArgsType, OffsetQueryArgsType, PagingStrategies } from '../../../src/types';
import { expectSDL } from '../../__fixtures__';
import { createResolverFromNest, TestResolverDTO, TestService } from '../__fixtures__';
import {
  federationRelationEmptySDL,
  federationRelationManyCustomNameSDL,
  federationRelationManyDisabledSDL,
  federationRelationManyNullableSDL,
  federationRelationManySDL,
  federationRelationOneCustomNameSDL,
  federationRelationOneDisabledSDL,
  federationRelationOneNullableSDL,
  federationRelationOneSDL,
  TestRelationDTO,
} from './__fixtures__';

describe('FederationResolver', () => {
  const expectResolverSDL = (sdl: string, opts?: RelationsOpts) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends FederationResolver(TestResolverDTO, opts) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }
    return expectSDL([TestSDLResolver], sdl);
  };

  it('should not add federation methods if one and many are empty', () => {
    return expectResolverSDL(federationRelationEmptySDL);
  });
  describe('one', () => {
    @Resolver(() => TestResolverDTO)
    class TestResolver extends FederationResolver(TestResolverDTO, {
      one: { relation: { DTO: TestRelationDTO }, custom: { DTO: TestRelationDTO, relationName: 'other' } },
    }) {
      constructor(service: TestService) {
        super(service);
      }
    }
    it('should use the object type name', () => {
      return expectResolverSDL(federationRelationOneSDL, { one: { relation: { DTO: TestRelationDTO } } });
    });

    it('should use the dtoName if provided', () => {
      return expectResolverSDL(federationRelationOneCustomNameSDL, {
        one: { relation: { DTO: TestRelationDTO, dtoName: 'Test' } },
      });
    });

    it('should set the field to nullable if set to true', () => {
      return expectResolverSDL(federationRelationOneNullableSDL, {
        one: { relation: { DTO: TestRelationDTO, nullable: true } },
      });
    });

    it('should not add federation one methods if disableRead is true', () => {
      return expectResolverSDL(federationRelationOneDisabledSDL, {
        one: { relation: { DTO: TestRelationDTO, disableRead: true } },
      });
    });

    it('should call the service findRelation with the provided dto', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const dto: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const output: TestRelationDTO = {
        id: 'id-2',
        testResolverId: dto.id,
      };
      when(mockService.findRelation(TestRelationDTO, 'relation', deepEqual([dto]))).thenResolve(
        new Map([[dto, output]]),
      );
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = await resolver.findRelation(dto, {});
      return expect(result).toEqual(output);
    });

    it('should call the service findRelation with the provided dto and correct relation name', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const dto: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const output: TestRelationDTO = {
        id: 'id-2',
        testResolverId: dto.id,
      };
      when(mockService.findRelation(TestRelationDTO, 'other', deepEqual([dto]))).thenResolve(new Map([[dto, output]]));
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = await resolver.findCustom(dto, {});
      return expect(result).toEqual(output);
    });
  });

  describe('many', () => {
    it('should use the object type name', () => {
      return expectResolverSDL(federationRelationManySDL, { many: { relations: { DTO: TestRelationDTO } } });
    });

    it('should use the dtoName if provided', () => {
      return expectResolverSDL(federationRelationManyCustomNameSDL, {
        many: { relations: { DTO: TestRelationDTO, dtoName: 'Test' } },
      });
    });

    it('should set the field to nullable if set to true', () => {
      return expectResolverSDL(federationRelationManyNullableSDL, {
        many: { relations: { DTO: TestRelationDTO, nullable: true } },
      });
    });

    it('should not add federation methods if disableRead is true', () => {
      return expectResolverSDL(federationRelationManyDisabledSDL, {
        many: { relations: { DTO: TestRelationDTO, disableRead: true } },
      });
    });

    describe('with cursor paging strategy', () => {
      @Resolver(() => TestResolverDTO)
      class TestResolver extends FederationResolver(TestResolverDTO, {
        one: { relation: { DTO: TestRelationDTO }, custom: { DTO: TestRelationDTO, relationName: 'other' } },
        many: { relations: { DTO: TestRelationDTO }, customs: { DTO: TestRelationDTO, relationName: 'others' } },
      }) {
        constructor(service: TestService) {
          super(service);
        }
      }

      it('should call the service findRelation with the provided dto', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const dto: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        const query: CursorQueryArgsType<TestRelationDTO> = {
          filter: { id: { eq: 'id-2' } },
          paging: { first: 1 },
        };
        const output: TestRelationDTO[] = [
          {
            id: 'id-2',
            testResolverId: dto.id,
          },
        ];
        when(
          mockService.queryRelations(
            TestRelationDTO,
            'relations',
            deepEqual([dto]),
            objectContaining({ ...query, paging: { limit: 2, offset: 0 } }),
          ),
        ).thenResolve(new Map([[dto, output]]));
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const result = await resolver.queryRelations(dto, query, {});
        return expect(result).toEqual({
          edges: [
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
              node: {
                id: output[0].id,
                testResolverId: dto.id,
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

      it('should call the service findRelation with the provided dto and correct relation name', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const dto: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        const query: CursorQueryArgsType<TestRelationDTO> = {
          filter: { id: { eq: 'id-2' } },
          paging: { first: 1 },
        };
        const output: TestRelationDTO[] = [
          {
            id: 'id-2',
            testResolverId: dto.id,
          },
        ];
        when(
          mockService.queryRelations(
            TestRelationDTO,
            'others',
            deepEqual([dto]),
            objectContaining({ ...query, paging: { limit: 2, offset: 0 } }),
          ),
        ).thenResolve(new Map([[dto, output]]));
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const result = await resolver.queryCustoms(dto, query, {});
        return expect(result).toEqual({
          edges: [
            {
              cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
              node: {
                id: output[0].id,
                testResolverId: dto.id,
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

    describe('with offset paging strategy', () => {
      @Resolver(() => TestResolverDTO)
      class TestResolver extends FederationResolver(TestResolverDTO, {
        many: {
          relations: { DTO: TestRelationDTO, pagingStrategy: PagingStrategies.OFFSET },
          customs: { DTO: TestRelationDTO, pagingStrategy: PagingStrategies.OFFSET, relationName: 'others' },
        },
      }) {
        constructor(service: TestService) {
          super(service);
        }
      }

      it('should call the service findRelation with the provided dto', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const dto: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        const query: OffsetQueryArgsType<TestRelationDTO> = {
          filter: { id: { eq: 'id-2' } },
          paging: { limit: 1 },
        };
        const output: TestRelationDTO[] = [
          {
            id: 'id-2',
            testResolverId: dto.id,
          },
        ];
        when(
          mockService.queryRelations(TestRelationDTO, 'relations', deepEqual([dto]), objectContaining(query)),
        ).thenResolve(new Map([[dto, output]]));
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const result = await resolver.queryRelations(dto, query, {});
        return expect(result).toEqual(output);
      });

      it('should call the service findRelation with the provided dto and correct relation name', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const dto: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        const query: OffsetQueryArgsType<TestRelationDTO> = {
          filter: { id: { eq: 'id-2' } },
          paging: { limit: 1 },
        };
        const output: TestRelationDTO[] = [
          {
            id: 'id-2',
            testResolverId: dto.id,
          },
        ];
        when(
          mockService.queryRelations(TestRelationDTO, 'others', deepEqual([dto]), objectContaining(query)),
        ).thenResolve(new Map([[dto, output]]));
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const result = await resolver.queryCustoms(dto, query, {});
        return expect(result).toEqual(output);
      });
    });
  });
});
