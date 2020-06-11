import { Query, Resolver } from '@nestjs/graphql';
import { deepEqual, objectContaining, when } from 'ts-mockito';
import { RelationsOpts } from '../../../src/resolvers';
import { ReadRelationsResolver } from '../../../src/resolvers/relations';
import { CursorQueryArgsType, LimitOffsetQueryArgsType, PagingStrategies } from '../../../src/types';
import { expectSDL } from '../../__fixtures__';
import { createResolverFromNest, TestResolverDTO, TestService } from '../__fixtures__';
import {
  readRelationEmptySDL,
  readRelationManyCustomNameSDL,
  readRelationManyDisabledSDL,
  readRelationManyLimitOffset,
  readRelationManyNullableSDL,
  readRelationManySDL,
  readRelationOneCustomNameSDL,
  readRelationOneDisabledSDL,
  readRelationOneNullableSDL,
  readRelationOneSDL,
  TestRelationDTO,
} from './__fixtures__';

@Resolver(() => TestResolverDTO)
class TestResolver extends ReadRelationsResolver(TestResolverDTO, {
  one: { relation: { DTO: TestRelationDTO }, custom: { DTO: TestRelationDTO, relationName: 'other' } },
  many: { relations: { DTO: TestRelationDTO }, customs: { DTO: TestRelationDTO, relationName: 'others' } },
}) {
  constructor(service: TestService) {
    super(service);
  }
}

describe('ReadRelationsResolver', () => {
  const expectResolverSDL = (sdl: string, opts?: RelationsOpts) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends ReadRelationsResolver(TestResolverDTO, opts ?? {}) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }
    return expectSDL([TestSDLResolver], sdl);
  };

  it('should not add read methods if one and many are empty', () => {
    return expectResolverSDL(readRelationEmptySDL);
  });
  describe('one', () => {
    it('should use the object type name', () => {
      return expectResolverSDL(readRelationOneSDL, { one: { relation: { DTO: TestRelationDTO } } });
    });

    it('should use the dtoName if provided', () => {
      return expectResolverSDL(readRelationOneCustomNameSDL, {
        one: { relation: { DTO: TestRelationDTO, dtoName: 'Test' } },
      });
    });

    it('should set the field to nullable if set to true', () => {
      return expectResolverSDL(readRelationOneNullableSDL, {
        one: { relation: { DTO: TestRelationDTO, nullable: true } },
      });
    });

    it('should not add read one methods if disableRead is true', () => {
      return expectResolverSDL(readRelationOneDisabledSDL, {
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
      return expectResolverSDL(readRelationManySDL, { many: { relations: { DTO: TestRelationDTO } } });
    });

    it('should use the dtoName if provided', () => {
      return expectResolverSDL(readRelationManyCustomNameSDL, {
        many: { relations: { DTO: TestRelationDTO, dtoName: 'Test' } },
      });
    });

    it('should set the field to nullable if set to true', () => {
      return expectResolverSDL(readRelationManyNullableSDL, {
        many: { relations: { DTO: TestRelationDTO, nullable: true } },
      });
    });

    it('should not use connections if pagingStrategy is limit offset', () => {
      return expectResolverSDL(readRelationManyLimitOffset, {
        many: { relations: { DTO: TestRelationDTO, nullable: true, pagingStrategy: PagingStrategies.LIMIT_OFFSET } },
      });
    });

    it('should not add read methods if disableRead is true', () => {
      return expectResolverSDL(readRelationManyDisabledSDL, {
        many: { relations: { DTO: TestRelationDTO, disableRead: true } },
      });
    });

    describe('many connection query', () => {
      it('should call the service queryRelations with the provided dto', async () => {
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
        const result = await resolver.queryRelationsConnection(dto, query, {});
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
        const result = await resolver.queryCustomsConnection(dto, query, {});
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

    describe('many limit offset query', () => {
      it('should call the service queryRelations with the provided dto', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const dto: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        const query: LimitOffsetQueryArgsType<TestRelationDTO> = {
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
          mockService.queryRelations(TestRelationDTO, 'relations', deepEqual([dto]), objectContaining({ ...query })),
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
