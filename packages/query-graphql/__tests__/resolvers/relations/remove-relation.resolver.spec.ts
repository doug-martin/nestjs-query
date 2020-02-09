import 'reflect-metadata';
import { QueryService } from '@nestjs-query/core';
import { ID, ObjectType } from 'type-graphql';
import * as nestGraphql from '@nestjs/graphql';
import { mock, instance, when, deepEqual } from 'ts-mockito';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { RemoveRelationsResolver } from '../../../src/resolvers/relations';
import * as decorators from '../../../src/decorators';
import { AdvancedOptions, ReturnTypeFuncValue } from '../../../src/external/type-graphql.types';
import { RelationArgsType, RelationsArgsType } from '../../../src/types';

@ObjectType('RemoveRelation')
class RemoveRelationDTO {
  @decorators.FilterableField(() => ID)
  id!: string;

  @decorators.FilterableField()
  stringField!: string;
}

@ObjectType('Relation')
class RelationDTO {
  @decorators.FilterableField(() => ID)
  id!: string;

  @decorators.FilterableField()
  readRelationId!: string;
}

class FakeCanActivate implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext): boolean {
    return false;
  }
}

describe('RemoveRelationsResolver', () => {
  const resolverMutationSpy = jest.spyOn(decorators, 'ResolverMutation');
  const argsSpy = jest.spyOn(nestGraphql, 'Args');

  beforeEach(() => jest.clearAllMocks());

  function assertResolverMutationCall(
    callNo: number,
    returnType: ReturnTypeFuncValue,
    advancedOpts: AdvancedOptions,
    ...opts: decorators.ResolverMethodOpts[]
  ) {
    const [rt, ao, ...rest] = resolverMutationSpy.mock.calls[callNo]!;
    expect(rt()).toEqual(returnType);
    expect(ao).toEqual(advancedOpts);
    expect(rest).toEqual(opts);
  }

  it('should not add read methods if one and many are empty', () => {
    RemoveRelationsResolver(RemoveRelationDTO, {});

    expect(resolverMutationSpy).not.toBeCalled();
    expect(argsSpy).not.toBeCalled();
  });

  describe('one', () => {
    it('should use the object type name', () => {
      const R = RemoveRelationsResolver(RemoveRelationDTO, { one: { relation: { DTO: RelationDTO } } });

      expect(resolverMutationSpy).toBeCalledTimes(1);
      assertResolverMutationCall(0, RemoveRelationDTO, {}, {});
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.removeRelationFromRemoveRelation).toBeInstanceOf(Function);
    });

    it('should use the dtoName if provided', () => {
      const R = RemoveRelationsResolver(RemoveRelationDTO, {
        one: { relation: { DTO: RelationDTO, dtoName: 'Test' } },
      });

      expect(resolverMutationSpy).toBeCalledTimes(1);
      assertResolverMutationCall(0, RemoveRelationDTO, {}, {});
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.removeTestFromRemoveRelation).toBeInstanceOf(Function);
    });

    it('should provide the resolver opts to the ResolverProperty decorator', () => {
      const resolverOpts: decorators.ResolverMethodOpts = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      const R = RemoveRelationsResolver(RemoveRelationDTO, {
        one: { relation: { DTO: RelationDTO, ...resolverOpts } },
      });

      expect(resolverMutationSpy).toBeCalledTimes(1);
      assertResolverMutationCall(0, RemoveRelationDTO, {}, resolverOpts);
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.removeRelationFromRemoveRelation).toBeInstanceOf(Function);
    });

    it('should not add read methods if disableRemove is true', () => {
      RemoveRelationsResolver(RemoveRelationDTO, { one: { relation: { DTO: RelationDTO, disableRemove: true } } });

      expect(resolverMutationSpy).not.toBeCalled();
      expect(argsSpy).not.toBeCalled();
    });

    it('should call the service findRelation with the provided dto and correct relation name', async () => {
      const mockService = mock<QueryService<RemoveRelationDTO>>();
      const args: RelationArgsType = {
        id: 'record-id',
        relationId: 'relation-id',
      };
      const output: RemoveRelationDTO = {
        id: 'record-id',
        stringField: 'foo',
      };
      const R = RemoveRelationsResolver(RemoveRelationDTO, { one: { relation: { DTO: RelationDTO } } });
      const resolver = new R(instance(mockService));
      when(mockService.removeRelation('relation', args.id, args.relationId)).thenResolve(output);
      // @ts-ignore
      const result = await resolver.removeRelationFromRemoveRelation(args);
      return expect(result).toEqual(output);
    });

    it('should call the service findRelation with the provided dto and correct relation name', async () => {
      const mockService = mock<QueryService<RemoveRelationDTO>>();
      const args: RelationArgsType = {
        id: 'record-id',
        relationId: 'relation-id',
      };
      const output: RemoveRelationDTO = {
        id: 'record-id',
        stringField: 'foo',
      };
      const R = RemoveRelationsResolver(RemoveRelationDTO, {
        one: { relation: { DTO: RelationDTO, relationName: 'other' } },
      });
      const resolver = new R(instance(mockService));
      when(mockService.removeRelation('other', args.id, args.relationId)).thenResolve(output);
      // @ts-ignore
      const result = await resolver.removeRelationFromRemoveRelation(args);
      return expect(result).toEqual(output);
    });
  });

  describe('many', () => {
    it('should use the object type name', () => {
      const R = RemoveRelationsResolver(RemoveRelationDTO, { many: { relations: { DTO: RelationDTO } } });

      expect(resolverMutationSpy).toBeCalledTimes(1);
      assertResolverMutationCall(0, RemoveRelationDTO, {}, {});
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.removeRelationsFromRemoveRelation).toBeInstanceOf(Function);
    });

    it('should use the dtoName if provided', () => {
      const R = RemoveRelationsResolver(RemoveRelationDTO, {
        many: { relation: { DTO: RelationDTO, dtoName: 'Test' } },
      });

      expect(resolverMutationSpy).toBeCalledTimes(1);
      assertResolverMutationCall(0, RemoveRelationDTO, {}, {});
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.removeTestsFromRemoveRelation).toBeInstanceOf(Function);
    });

    it('should provide the resolver opts to the ResolverProperty decorator', () => {
      const resolverOpts: decorators.ResolverMethodOpts = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      const R = RemoveRelationsResolver(RemoveRelationDTO, {
        many: { relation: { DTO: RelationDTO, ...resolverOpts } },
      });

      expect(resolverMutationSpy).toBeCalledTimes(1);
      assertResolverMutationCall(0, RemoveRelationDTO, {}, resolverOpts);
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.removeRelationsFromRemoveRelation).toBeInstanceOf(Function);
    });

    it('should not add read methods if disableRemove is true', () => {
      RemoveRelationsResolver(RemoveRelationDTO, { many: { relation: { DTO: RelationDTO, disableRemove: true } } });

      expect(resolverMutationSpy).not.toBeCalled();
      expect(argsSpy).not.toBeCalled();
    });

    it('should call the service findRelation with the provided dto and correct relation name', async () => {
      const mockService = mock<QueryService<RemoveRelationDTO>>();
      const args: RelationsArgsType = {
        id: 'id-1',
        relationIds: ['relation-id-1', 'relation-id-2'],
      };
      const output: RemoveRelationDTO = {
        id: 'record-id',
        stringField: 'foo',
      };
      const R = RemoveRelationsResolver(RemoveRelationDTO, { many: { relation: { DTO: RelationDTO } } });
      const resolver = new R(instance(mockService));
      when(mockService.removeRelations('relations', args.id, deepEqual(args.relationIds))).thenResolve(output);
      // @ts-ignore
      const result = await resolver.removeRelationsFromRemoveRelation(args);
      return expect(result).toEqual(output);
    });

    it('should call the service findRelation with the provided dto and correct relation name', async () => {
      const mockService = mock<QueryService<RemoveRelationDTO>>();
      const args: RelationsArgsType = {
        id: 'id-1',
        relationIds: ['relation-id-1', 'relation-id-2'],
      };
      const output: RemoveRelationDTO = {
        id: 'record-id',
        stringField: 'foo',
      };
      const R = RemoveRelationsResolver(RemoveRelationDTO, {
        many: { relation: { DTO: RelationDTO, relationName: 'other' } },
      });
      const resolver = new R(instance(mockService));
      when(mockService.removeRelations('other', args.id, deepEqual(args.relationIds))).thenResolve(output);
      // @ts-ignore
      const result = await resolver.removeRelationsFromRemoveRelation(args);
      return expect(result).toEqual(output);
    });
  });
});
