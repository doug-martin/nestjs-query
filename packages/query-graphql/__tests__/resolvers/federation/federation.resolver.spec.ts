import { Class } from '@nestjs-query/core';
import { ObjectType, Query, Resolver, ID } from '@nestjs/graphql';
import { deepEqual, objectContaining, when } from 'ts-mockito';
import {
  CursorConnection,
  CursorQueryArgsType,
  FederationResolver,
  FilterableField,
  OffsetConnection,
  OffsetQueryArgsType,
  Relation,
  AllRelations,
} from '../../../src';
import { expectSDL } from '../../__fixtures__';
import { createResolverFromNest, TestResolverDTO, TestService } from '../__fixtures__';
import { federationRelationEmptySDL, federationRelationSDL, TestRelationDTO } from './__fixtures__';

describe('FederationResolver', () => {
  const expectResolverSDL = <DTO extends TestResolverDTO>(sdl: string, DTOClass: Class<DTO>) => {
    @Resolver(() => DTOClass)
    class TestSDLResolver extends FederationResolver(DTOClass) {
      @Query(() => DTOClass)
      test(): DTO {
        return { id: '1', stringField: 'foo' } as DTO;
      }
    }
    return expectSDL([TestSDLResolver], sdl);
  };

  @ObjectType('TestFederated')
  @Relation('relation', () => TestRelationDTO)
  @Relation('custom', () => TestRelationDTO, { relationName: 'other' })
  @AllRelations('allRelations', () => TestRelationDTO)
  @OffsetConnection('relationOffsetConnection', () => TestRelationDTO)
  @CursorConnection('relationCursorConnection', () => TestRelationDTO)
  class TestFederatedDTO extends TestResolverDTO {
    @FilterableField(() => ID)
    id!: string;

    @FilterableField()
    stringField!: string;
  }

  @Resolver(() => TestFederatedDTO)
  class TestResolver extends FederationResolver(TestFederatedDTO) {
    constructor(service: TestService) {
      super(service);
    }
  }

  it('should not add federation methods if one and many are empty', () =>
    expectResolverSDL(federationRelationEmptySDL, TestResolverDTO));

  it('use the defined relations', () => expectResolverSDL(federationRelationSDL, TestFederatedDTO));

  describe('one', () => {
    describe('one relation', () => {
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
        when(
          mockService.findRelation(TestRelationDTO, 'relation', deepEqual([dto]), deepEqual({ filter: undefined })),
        ).thenResolve(new Map([[dto, output]]));
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
        when(
          mockService.findRelation(TestRelationDTO, 'other', deepEqual([dto]), deepEqual({ filter: undefined })),
        ).thenResolve(new Map([[dto, output]]));
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const result = await resolver.findCustom(dto, {});
        return expect(result).toEqual(output);
      });
    });
  });

  describe('many - connection', () => {
    describe('with cursor paging strategy', () => {
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
            'relationCursorConnections',
            deepEqual([dto]),
            objectContaining({ ...query, paging: { limit: 2, offset: 0 } }),
          ),
        ).thenResolve(new Map([[dto, output]]));
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const result = await resolver.queryRelationCursorConnections(dto, query, {});
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
          totalCountFn: expect.any(Function),
        });
      });
    });
  });

  describe('with offset paging strategy', () => {
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
        mockService.queryRelations(
          TestRelationDTO,
          'relationOffsetConnections',
          deepEqual([dto]),
          objectContaining({ ...query, paging: { limit: 2 } }),
        ),
      ).thenResolve(new Map([[dto, output]]));
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = await resolver.queryRelationOffsetConnections(dto, query, {});
      return expect(result).toEqual({
        nodes: output,
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
        totalCountFn: expect.any(Function),
      });
    });
  });

  describe('with no paging strategy', () => {
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
        mockService.queryRelations(
          TestRelationDTO,
          'allRelations',
          deepEqual([dto]),
          objectContaining({ filter: query.filter }),
        ),
      ).thenResolve(new Map([[dto, output]]));
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = await resolver.queryAllRelations(dto, query, {});
      return expect(result).toEqual(output);
    });
  });
});
