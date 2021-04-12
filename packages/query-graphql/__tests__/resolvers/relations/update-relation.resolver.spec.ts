import { when, deepEqual } from 'ts-mockito';
import { Resolver, Query } from '@nestjs/graphql';
import { RelationsOpts, UpdateRelationsResolver } from '../../../src/resolvers/relations';
import { RelationInputType, RelationsInputType } from '../../../src/types';
import { expectSDL } from '../../__fixtures__';
import { createResolverFromNest, TestResolverDTO, TestService } from '../__fixtures__';
import {
  TestRelationDTO,
  updateRelationEmptySDL,
  updateRelationManyCustomNameSDL,
  updateRelationManyDisabledSDL,
  updateRelationManySDL,
  updateRelationOneCustomNameSDL,
  updateRelationOneDisabledSDL,
  updateRelationOneSDL,
} from './__fixtures__';

@Resolver(() => TestResolverDTO)
class TestResolver extends UpdateRelationsResolver(TestResolverDTO, {
  one: { relation: { DTO: TestRelationDTO }, custom: { DTO: TestRelationDTO, relationName: 'other' } },
  many: { relations: { DTO: TestRelationDTO }, customs: { DTO: TestRelationDTO, relationName: 'others' } },
}) {
  constructor(service: TestService) {
    super(service);
  }
}

describe('UpdateRelationsResolver', () => {
  const expectResolverSDL = (sdl: string, opts?: RelationsOpts) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends UpdateRelationsResolver(TestResolverDTO, opts ?? {}) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }
    return expectSDL([TestSDLResolver], sdl);
  };

  it('should not add update methods if one and many are empty', () => expectResolverSDL(updateRelationEmptySDL));

  describe('one', () => {
    it('should use the object type name', () =>
      expectResolverSDL(updateRelationOneSDL, { one: { relation: { DTO: TestRelationDTO } } }));

    it('should use the dtoName if provided', () =>
      expectResolverSDL(updateRelationOneCustomNameSDL, {
        one: { relation: { DTO: TestRelationDTO, dtoName: 'Test' } },
      }));

    it('should not add update one methods if disableRead is true', () =>
      expectResolverSDL(updateRelationOneDisabledSDL, {
        one: { relation: { DTO: TestRelationDTO, disableUpdate: true } },
      }));

    it('should call the service findRelation with the provided dto and correct relation name', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const input: RelationInputType = {
        id: 'record-id',
        relationId: 'relation-id',
      };
      const output: TestResolverDTO = {
        id: 'record-id',
        stringField: 'foo',
      };
      when(mockService.setRelation('relation', input.id, input.relationId, undefined)).thenResolve(output);
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = await resolver.setRelationOnTestResolverDTO({ input });
      return expect(result).toEqual(output);
    });

    it('should call the service findRelation with the provided dto and custom relation name', async () => {
      const { resolver, mockService } = await createResolverFromNest(TestResolver);
      const input: RelationInputType = {
        id: 'record-id',
        relationId: 'relation-id',
      };
      const output: TestResolverDTO = {
        id: 'record-id',
        stringField: 'foo',
      };
      when(mockService.setRelation('other', input.id, input.relationId, undefined)).thenResolve(output);
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = await resolver.setCustomOnTestResolverDTO({ input });
      return expect(result).toEqual(output);
    });
  });

  describe('many', () => {
    it('should use the object type name', () =>
      expectResolverSDL(updateRelationManySDL, { many: { relations: { DTO: TestRelationDTO } } }));

    it('should use the dtoName if provided', () =>
      expectResolverSDL(updateRelationManyCustomNameSDL, {
        many: { relations: { DTO: TestRelationDTO, dtoName: 'Test' } },
      }));

    it('should not add update many methods if disableUpdate is true', () =>
      expectResolverSDL(updateRelationManyDisabledSDL, {
        many: { relations: { DTO: TestRelationDTO, disableUpdate: true } },
      }));

    describe('add relations', () => {
      it('should call the service addRelations with the dto id and relationIds', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const input: RelationsInputType = {
          id: 'id-1',
          relationIds: ['relation-id-1', 'relation-id-2'],
        };
        const output: TestResolverDTO = {
          id: 'record-id',
          stringField: 'foo',
        };
        when(mockService.addRelations('relations', input.id, deepEqual(input.relationIds), undefined)).thenResolve(
          output,
        );
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const result = await resolver.addRelationsToTestResolverDTO({ input });
        return expect(result).toEqual(output);
      });

      it('should call the service addRelations with the custom dto name dto id and relationIds', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const input: RelationsInputType = {
          id: 'id-1',
          relationIds: ['relation-id-1', 'relation-id-2'],
        };
        const output: TestResolverDTO = {
          id: 'record-id',
          stringField: 'foo',
        };
        when(mockService.addRelations('others', input.id, deepEqual(input.relationIds), undefined)).thenResolve(output);
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const result = await resolver.addCustomsToTestResolverDTO({ input });
        return expect(result).toEqual(output);
      });
    });

    describe('set relations', () => {
      it('should call the service setRelations with the dto id and relationIds', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const input: RelationsInputType = {
          id: 'id-1',
          relationIds: ['relation-id-1', 'relation-id-2'],
        };
        const output: TestResolverDTO = {
          id: 'record-id',
          stringField: 'foo',
        };
        when(mockService.setRelations('relations', input.id, deepEqual(input.relationIds), undefined)).thenResolve(
          output,
        );
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const result = await resolver.setRelationsOnTestResolverDTO({ input });
        return expect(result).toEqual(output);
      });

      it('should call the service setRelations with the dto id and an empty relationIds', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const input: RelationsInputType = {
          id: 'id-1',
          relationIds: [],
        };
        const output: TestResolverDTO = {
          id: 'record-id',
          stringField: 'foo',
        };
        when(mockService.setRelations('relations', input.id, deepEqual(input.relationIds), undefined)).thenResolve(
          output,
        );
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const result = await resolver.setRelationsOnTestResolverDTO({ input });
        return expect(result).toEqual(output);
      });

      it('should call the service setRelations with the custom dto name dto id and relationIds', async () => {
        const { resolver, mockService } = await createResolverFromNest(TestResolver);
        const input: RelationsInputType = {
          id: 'id-1',
          relationIds: ['relation-id-1', 'relation-id-2'],
        };
        const output: TestResolverDTO = {
          id: 'record-id',
          stringField: 'foo',
        };
        when(mockService.setRelations('others', input.id, deepEqual(input.relationIds), undefined)).thenResolve(output);
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const result = await resolver.setCustomsOnTestResolverDTO({ input });
        return expect(result).toEqual(output);
      });
    });
  });
});
