import 'reflect-metadata';
import { QueryService } from '@nestjs-query/core';
import { ID, ObjectType } from 'type-graphql';
import * as nestGraphql from '@nestjs/graphql';
import { mock, instance, when, deepEqual } from 'ts-mockito';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { UpdateRelationsResolver } from '../../../src/resolvers/relations';
import * as decorators from '../../../src/decorators';
import { AdvancedOptions, ReturnTypeFuncValue } from '../../../src/external/type-graphql.types';
import { RelationArgsType, RelationsArgsType } from '../../../src/types';

@ObjectType('UpdateRelation')
class UpdateRelationDTO {
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

describe('UpdateRelationsResolver', () => {
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
    UpdateRelationsResolver(UpdateRelationDTO, {});

    expect(resolverMutationSpy).not.toBeCalled();
    expect(argsSpy).not.toBeCalled();
  });

  describe('one', () => {
    it('should use the object type name', () => {
      const R = UpdateRelationsResolver(UpdateRelationDTO, { one: { relation: { DTO: RelationDTO } } });

      expect(resolverMutationSpy).toBeCalledTimes(1);
      assertResolverMutationCall(0, UpdateRelationDTO, {}, {});
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.setRelationOnUpdateRelation).toBeInstanceOf(Function);
    });

    it('should use the dtoName if provided', () => {
      const R = UpdateRelationsResolver(UpdateRelationDTO, {
        one: { relation: { DTO: RelationDTO, dtoName: 'Test' } },
      });

      expect(resolverMutationSpy).toBeCalledTimes(1);
      assertResolverMutationCall(0, UpdateRelationDTO, {}, {});
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.setTestOnUpdateRelation).toBeInstanceOf(Function);
    });

    it('should provide the resolver opts to the ResolverProperty decorator', () => {
      const resolverOpts: decorators.ResolverMethodOpts = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      const R = UpdateRelationsResolver(UpdateRelationDTO, {
        one: { relation: { DTO: RelationDTO, ...resolverOpts } },
      });

      expect(resolverMutationSpy).toBeCalledTimes(1);
      assertResolverMutationCall(0, UpdateRelationDTO, {}, resolverOpts);
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.setRelationOnUpdateRelation).toBeInstanceOf(Function);
    });

    it('should not add read methods if disableUpdate is true', () => {
      UpdateRelationsResolver(UpdateRelationDTO, { one: { relation: { DTO: RelationDTO, disableUpdate: true } } });

      expect(resolverMutationSpy).not.toBeCalled();
      expect(argsSpy).not.toBeCalled();
    });

    it('should call the service findRelation with the provided dto and correct relation name', async () => {
      const mockService = mock<QueryService<UpdateRelationDTO>>();
      const args: RelationArgsType = {
        id: 'record-id',
        relationId: 'relation-id',
      };
      const output: UpdateRelationDTO = {
        id: 'record-id',
        stringField: 'foo',
      };
      const R = UpdateRelationsResolver(UpdateRelationDTO, { one: { relation: { DTO: RelationDTO } } });
      const resolver = new R(instance(mockService));
      when(mockService.setRelation('relation', args.id, args.relationId)).thenResolve(output);
      // @ts-ignore
      const result = await resolver.setRelationOnUpdateRelation(args);
      return expect(result).toEqual(output);
    });

    it('should call the service findRelation with the provided dto and correct relation name', async () => {
      const mockService = mock<QueryService<UpdateRelationDTO>>();
      const args: RelationArgsType = {
        id: 'record-id',
        relationId: 'relation-id',
      };
      const output: UpdateRelationDTO = {
        id: 'record-id',
        stringField: 'foo',
      };
      const R = UpdateRelationsResolver(UpdateRelationDTO, {
        one: { relation: { DTO: RelationDTO, relationName: 'other' } },
      });
      const resolver = new R(instance(mockService));
      when(mockService.setRelation('other', args.id, args.relationId)).thenResolve(output);
      // @ts-ignore
      const result = await resolver.setRelationOnUpdateRelation(args);
      return expect(result).toEqual(output);
    });
  });

  describe('many', () => {
    it('should use the object type name', () => {
      const R = UpdateRelationsResolver(UpdateRelationDTO, { many: { relations: { DTO: RelationDTO } } });

      expect(resolverMutationSpy).toBeCalledTimes(1);
      assertResolverMutationCall(0, UpdateRelationDTO, {}, {});
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.addRelationsToUpdateRelation).toBeInstanceOf(Function);
    });

    it('should use the dtoName if provided', () => {
      const R = UpdateRelationsResolver(UpdateRelationDTO, {
        many: { relation: { DTO: RelationDTO, dtoName: 'Test' } },
      });

      expect(resolverMutationSpy).toBeCalledTimes(1);
      assertResolverMutationCall(0, UpdateRelationDTO, {}, {});
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.addTestsToUpdateRelation).toBeInstanceOf(Function);
    });

    it('should provide the resolver opts to the ResolverProperty decorator', () => {
      const resolverOpts: decorators.ResolverMethodOpts = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      const R = UpdateRelationsResolver(UpdateRelationDTO, {
        many: { relation: { DTO: RelationDTO, ...resolverOpts } },
      });

      expect(resolverMutationSpy).toBeCalledTimes(1);
      assertResolverMutationCall(0, UpdateRelationDTO, {}, resolverOpts);
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.addRelationsToUpdateRelation).toBeInstanceOf(Function);
    });

    it('should not add read methods if disableUpdate is true', () => {
      UpdateRelationsResolver(UpdateRelationDTO, { many: { relation: { DTO: RelationDTO, disableUpdate: true } } });

      expect(resolverMutationSpy).not.toBeCalled();
      expect(argsSpy).not.toBeCalled();
    });

    it('should call the service findRelation with the provided dto and correct relation name', async () => {
      const mockService = mock<QueryService<UpdateRelationDTO>>();
      const args: RelationsArgsType = {
        id: 'id-1',
        relationIds: ['relation-id-1', 'relation-id-2'],
      };
      const output: UpdateRelationDTO = {
        id: 'record-id',
        stringField: 'foo',
      };
      const R = UpdateRelationsResolver(UpdateRelationDTO, { many: { relation: { DTO: RelationDTO } } });
      const resolver = new R(instance(mockService));
      when(mockService.addRelations('relations', args.id, deepEqual(args.relationIds))).thenResolve(output);
      // @ts-ignore
      const result = await resolver.addRelationsToUpdateRelation(args);
      return expect(result).toEqual(output);
    });

    it('should call the service findRelation with the provided dto and correct relation name', async () => {
      const mockService = mock<QueryService<UpdateRelationDTO>>();
      const args: RelationsArgsType = {
        id: 'id-1',
        relationIds: ['relation-id-1', 'relation-id-2'],
      };
      const output: UpdateRelationDTO = {
        id: 'record-id',
        stringField: 'foo',
      };
      const R = UpdateRelationsResolver(UpdateRelationDTO, {
        many: { relation: { DTO: RelationDTO, relationName: 'other' } },
      });
      const resolver = new R(instance(mockService));
      when(mockService.addRelations('other', args.id, deepEqual(args.relationIds))).thenResolve(output);
      // @ts-ignore
      const result = await resolver.addRelationsToUpdateRelation(args);
      return expect(result).toEqual(output);
    });
  });
});
