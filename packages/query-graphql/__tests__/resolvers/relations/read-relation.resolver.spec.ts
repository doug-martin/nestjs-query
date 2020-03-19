import 'reflect-metadata';
import { Query, QueryService } from '@nestjs-query/core';
import * as nestGraphql from '@nestjs/graphql';
import { mock, instance, when, objectContaining, deepEqual } from 'ts-mockito';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ReturnTypeFuncValue, ResolveFieldOptions } from '@nestjs/graphql';
import { ReadRelationsResolver } from '../../../src/resolvers/relations';
import * as decorators from '../../../src/decorators';
import * as types from '../../../src/types';

const { ID, ObjectType } = nestGraphql;

@ObjectType('ReadRelation')
class ReadRelationDTO {
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

describe('ReadRelationsResolver', () => {
  const resolverFieldSpy = jest.spyOn(decorators, 'ResolverField');
  const queryArgsTypeSpy = jest.spyOn(types, 'QueryArgsType');
  const connectionTypeSpy = jest.spyOn(types, 'ConnectionType');
  const argsSpy = jest.spyOn(nestGraphql, 'Args');
  const parentSpy = jest.spyOn(nestGraphql, 'Parent');

  beforeEach(() => jest.clearAllMocks());

  function assertResolverFieldCall(
    callNo: number,
    propName: string,
    returnType: ReturnTypeFuncValue,
    advancedOpts: ResolveFieldOptions,
    ...opts: decorators.ResolverMethodOpts[]
  ) {
    const [n, rt, ao, ...rest] = resolverFieldSpy.mock.calls[callNo]!;
    expect(n).toEqual(propName);
    expect(rt()).toEqual(returnType);
    expect(ao).toEqual(advancedOpts);
    expect(rest).toEqual(opts);
  }

  it('should not add read methods if one and many are empty', () => {
    ReadRelationsResolver(ReadRelationDTO, {});

    expect(queryArgsTypeSpy).not.toBeCalled();
    expect(connectionTypeSpy).not.toBeCalled();
    expect(resolverFieldSpy).not.toBeCalled();
    expect(parentSpy).not.toBeCalled();
    expect(argsSpy).not.toBeCalled();
  });

  describe('one', () => {
    it('should use the object type name', () => {
      const R = ReadRelationsResolver(ReadRelationDTO, { one: { relation: { DTO: RelationDTO } } });

      expect(queryArgsTypeSpy).not.toBeCalled();
      expect(connectionTypeSpy).not.toBeCalled();
      expect(resolverFieldSpy).toBeCalledTimes(1);
      assertResolverFieldCall(0, 'relation', RelationDTO, {}, {});
      expect(parentSpy).toBeCalledTimes(1);
      expect(argsSpy).not.toBeCalled();
      expect(R.prototype.findRelation).toBeInstanceOf(Function);
    });

    it('should use the dtoName if provided', () => {
      const R = ReadRelationsResolver(ReadRelationDTO, { one: { relation: { DTO: RelationDTO, dtoName: 'Test' } } });

      expect(queryArgsTypeSpy).not.toBeCalled();
      expect(connectionTypeSpy).not.toBeCalled();
      expect(resolverFieldSpy).toBeCalledTimes(1);
      assertResolverFieldCall(0, 'test', RelationDTO, {}, {});
      expect(parentSpy).toBeCalledTimes(1);
      expect(argsSpy).not.toBeCalled();
      expect(R.prototype.findTest).toBeInstanceOf(Function);
    });

    it('should set the field to nullable if set to true', () => {
      const R = ReadRelationsResolver(ReadRelationDTO, { one: { relation: { DTO: RelationDTO, nullable: true } } });

      expect(queryArgsTypeSpy).not.toBeCalled();
      expect(connectionTypeSpy).not.toBeCalled();
      expect(resolverFieldSpy).toBeCalledTimes(1);
      assertResolverFieldCall(0, 'relation', RelationDTO, { nullable: true }, {});
      expect(parentSpy).toBeCalledTimes(1);
      expect(argsSpy).not.toBeCalled();
      expect(R.prototype.findRelation).toBeInstanceOf(Function);
    });

    it('should provide the resolver opts to the ResolverProperty decorator', () => {
      const resolverOpts: decorators.ResolverMethodOpts = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      const R = ReadRelationsResolver(ReadRelationDTO, { one: { relation: { DTO: RelationDTO, ...resolverOpts } } });

      expect(queryArgsTypeSpy).not.toBeCalled();
      expect(connectionTypeSpy).not.toBeCalled();
      expect(resolverFieldSpy).toBeCalledTimes(1);
      assertResolverFieldCall(0, 'relation', RelationDTO, {}, resolverOpts);
      expect(parentSpy).toBeCalledTimes(1);
      expect(argsSpy).not.toBeCalled();
      expect(R.prototype.findRelation).toBeInstanceOf(Function);
    });

    it('should not add read methods if disableRead is true', () => {
      ReadRelationsResolver(ReadRelationDTO, { one: { relation: { DTO: RelationDTO, disableRead: true } } });

      expect(queryArgsTypeSpy).not.toBeCalled();
      expect(connectionTypeSpy).not.toBeCalled();
      expect(resolverFieldSpy).not.toBeCalled();
      expect(parentSpy).not.toBeCalled();
      expect(argsSpy).not.toBeCalled();
    });

    it('should call the service findRelation with the provided dto', async () => {
      const mockService = mock<QueryService<ReadRelationDTO>>();
      const dto: ReadRelationDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const output: RelationDTO = {
        id: 'id-2',
        readRelationId: dto.id,
      };
      const R = ReadRelationsResolver(ReadRelationDTO, { one: { relation: { DTO: RelationDTO } } });
      const resolver = new R(instance(mockService));
      when(mockService.findRelation(RelationDTO, 'relation', deepEqual([dto]))).thenResolve(new Map([[dto, output]]));
      // @ts-ignore
      const result = await resolver.findRelation(dto, {});
      return expect(result).toEqual(output);
    });

    it('should call the service findRelation with the provided dto and correct relation name', async () => {
      const mockService = mock<QueryService<ReadRelationDTO>>();
      const dto: ReadRelationDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const output: RelationDTO = {
        id: 'id-2',
        readRelationId: dto.id,
      };
      const R = ReadRelationsResolver(ReadRelationDTO, {
        one: { relation: { DTO: RelationDTO, relationName: 'other' } },
      });
      const resolver = new R(instance(mockService));
      when(mockService.findRelation(RelationDTO, 'other', deepEqual([dto]))).thenResolve(new Map([[dto, output]]));
      // @ts-ignore
      const result = await resolver.findRelation(dto, {});
      return expect(result).toEqual(output);
    });
  });

  describe('many', () => {
    it('should use the object type name', () => {
      const R = ReadRelationsResolver(ReadRelationDTO, { many: { relations: { DTO: RelationDTO } } });

      expect(queryArgsTypeSpy).toBeCalledWith(RelationDTO);
      expect(connectionTypeSpy).toBeCalledWith(RelationDTO);
      const Connection = connectionTypeSpy.mock.results[0].value;
      expect(resolverFieldSpy).toBeCalledTimes(1);
      assertResolverFieldCall(0, 'relations', Connection, {}, {});
      expect(parentSpy).toBeCalledTimes(1);
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.queryRelations).toBeInstanceOf(Function);
    });

    it('should use the dtoName if provided', () => {
      const R = ReadRelationsResolver(ReadRelationDTO, { many: { relation: { DTO: RelationDTO, dtoName: 'Test' } } });

      expect(queryArgsTypeSpy).toBeCalledWith(RelationDTO);
      expect(connectionTypeSpy).toBeCalledWith(RelationDTO);
      const Connection = connectionTypeSpy.mock.results[0].value;
      expect(resolverFieldSpy).toBeCalledTimes(1);
      assertResolverFieldCall(0, 'tests', Connection, {}, {});
      expect(parentSpy).toBeCalledTimes(1);
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.queryTests).toBeInstanceOf(Function);
    });

    it('should set the field to nullable if set to true', () => {
      const R = ReadRelationsResolver(ReadRelationDTO, { many: { relation: { DTO: RelationDTO, nullable: true } } });

      expect(queryArgsTypeSpy).toBeCalledWith(RelationDTO);
      expect(connectionTypeSpy).toBeCalledWith(RelationDTO);
      const Connection = connectionTypeSpy.mock.results[0].value;
      expect(resolverFieldSpy).toBeCalledTimes(1);
      assertResolverFieldCall(0, 'relations', Connection, { nullable: true }, {});
      expect(parentSpy).toBeCalledTimes(1);
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.queryRelations).toBeInstanceOf(Function);
    });

    it('should provide the resolver opts to the ResolverProperty decorator', () => {
      const resolverOpts: decorators.ResolverMethodOpts = {
        disabled: false,
        filters: [],
        guards: [FakeCanActivate],
        interceptors: [],
        pipes: [],
      };
      const R = ReadRelationsResolver(ReadRelationDTO, { many: { relation: { DTO: RelationDTO, ...resolverOpts } } });

      expect(queryArgsTypeSpy).toBeCalledWith(RelationDTO);
      expect(connectionTypeSpy).toBeCalledWith(RelationDTO);
      const Connection = connectionTypeSpy.mock.results[0].value;
      expect(resolverFieldSpy).toBeCalledTimes(1);
      assertResolverFieldCall(0, 'relations', Connection, {}, resolverOpts);
      expect(parentSpy).toBeCalledTimes(1);
      expect(argsSpy).toBeCalledTimes(1);
      expect(R.prototype.queryRelations).toBeInstanceOf(Function);
    });

    it('should not add read methods if disableRead is true', () => {
      ReadRelationsResolver(ReadRelationDTO, { many: { relation: { DTO: RelationDTO, disableRead: true } } });

      expect(queryArgsTypeSpy).not.toBeCalled();
      expect(connectionTypeSpy).not.toBeCalled();
      expect(resolverFieldSpy).not.toBeCalled();
      expect(parentSpy).not.toBeCalled();
      expect(argsSpy).not.toBeCalled();
    });

    it('should call the service findRelation with the provided dto', async () => {
      const mockService = mock<QueryService<ReadRelationDTO>>();
      const dto: ReadRelationDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const query: Query<RelationDTO> = {
        filter: { id: { eq: 'id-2' } },
      };
      const output: RelationDTO[] = [
        {
          id: 'id-2',
          readRelationId: dto.id,
        },
      ];
      const R = ReadRelationsResolver(ReadRelationDTO, { many: { relation: { DTO: RelationDTO } } });
      const resolver = new R(instance(mockService));
      when(mockService.queryRelations(RelationDTO, 'relations', deepEqual([dto]), objectContaining(query))).thenResolve(
        new Map([[dto, output]]),
      );
      // @ts-ignore
      const result = await resolver.queryRelations(dto, query, {});
      return expect(result).toEqual({
        edges: [
          {
            cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            node: {
              id: output[0].id,
              readRelationId: dto.id,
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
      const mockService = mock<QueryService<ReadRelationDTO>>();
      const dto: ReadRelationDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const query: Query<RelationDTO> = {
        filter: { id: { eq: 'id-2' } },
      };
      const output: RelationDTO[] = [
        {
          id: 'id-2',
          readRelationId: dto.id,
        },
      ];
      const R = ReadRelationsResolver(ReadRelationDTO, {
        many: { relation: { DTO: RelationDTO, relationName: 'other' } },
      });
      const resolver = new R(instance(mockService));
      when(mockService.queryRelations(RelationDTO, 'other', deepEqual([dto]), objectContaining(query))).thenResolve(
        new Map([[dto, output]]),
      );
      // @ts-ignore
      const result = await resolver.queryRelations(dto, query, {});
      return expect(result).toEqual({
        edges: [
          {
            cursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            node: {
              id: output[0].id,
              readRelationId: dto.id,
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
});
