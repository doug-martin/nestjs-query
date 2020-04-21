import 'reflect-metadata';
import * as nestGraphql from '@nestjs/graphql';
import { Field, ReturnTypeFuncValue, ResolveFieldOptions } from '@nestjs/graphql';
import { ExecutionContext, CanActivate } from '@nestjs/common';
import { ReferencesRelationsResolver } from '../../../src/resolvers/relations';
import * as decorators from '../../../src/decorators';

const { ID, ObjectType } = nestGraphql;

@ObjectType('ReferenceResolverDTO')
class ReferenceResolverDTO {
  @decorators.FilterableField(() => ID)
  id!: string;

  @Field(() => ID)
  referenceId!: string;
}

@ObjectType('Relation')
class ReferenceDTO {
  @Field(() => ID)
  id!: string;
}

class FakeCanActivate implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(context: ExecutionContext): boolean {
    return false;
  }
}

describe('ReferencesRelationMixin', () => {
  const resolverFieldSpy = jest.spyOn(decorators, 'ResolverField');
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

  it('should not add read methods if references empty', () => {
    ReferencesRelationsResolver(ReferenceResolverDTO, {});

    expect(resolverFieldSpy).not.toBeCalled();
    expect(parentSpy).not.toBeCalled();
  });

  it('should use the object type name', () => {
    const R = ReferencesRelationsResolver(ReferenceResolverDTO, {
      relation: { DTO: ReferenceDTO, keys: { id: 'referenceId' } },
    });

    expect(resolverFieldSpy).toBeCalledTimes(1);
    assertResolverFieldCall(0, 'relation', ReferenceDTO, {}, {});
    expect(parentSpy).toBeCalledTimes(1);
    expect(R.prototype.relationReference).toBeInstanceOf(Function);
  });

  it('should use the dtoName if provided', () => {
    const R = ReferencesRelationsResolver(ReferenceResolverDTO, {
      relation: { DTO: ReferenceDTO, keys: { id: 'referenceId' }, dtoName: 'Test' },
    });

    expect(resolverFieldSpy).toBeCalledTimes(1);
    assertResolverFieldCall(0, 'test', ReferenceDTO, {}, {});
    expect(parentSpy).toBeCalledTimes(1);
    expect(R.prototype.testReference).toBeInstanceOf(Function);
  });

  it('should set the field to nullable if set to true', () => {
    const R = ReferencesRelationsResolver(ReferenceResolverDTO, {
      relation: { DTO: ReferenceDTO, keys: { id: 'referenceId' }, nullable: true },
    });

    expect(resolverFieldSpy).toBeCalledTimes(1);
    assertResolverFieldCall(0, 'relation', ReferenceDTO, { nullable: true }, {});
    expect(parentSpy).toBeCalledTimes(1);
    expect(R.prototype.relationReference).toBeInstanceOf(Function);
  });

  it('should provide the resolver opts to the ResolverField decorator', () => {
    const resolverOpts: decorators.ResolverMethodOpts = {
      disabled: false,
      filters: [],
      guards: [FakeCanActivate],
      interceptors: [],
      pipes: [],
    };
    const R = ReferencesRelationsResolver(ReferenceResolverDTO, {
      relation: { DTO: ReferenceDTO, keys: { id: 'referenceId' }, ...resolverOpts },
    });

    expect(resolverFieldSpy).toBeCalledTimes(1);
    assertResolverFieldCall(0, 'relation', ReferenceDTO, {}, resolverOpts);
    expect(parentSpy).toBeCalledTimes(1);
    expect(R.prototype.relationReference).toBeInstanceOf(Function);
  });

  it('should return a references type from the passed in dto', async () => {
    const output: ReferenceDTO = {
      id: 'id-2',
    };
    const dto: ReferenceResolverDTO = {
      id: 'id-1',
      referenceId: output.id,
    };
    const R = ReferencesRelationsResolver(ReferenceResolverDTO, {
      relation: { DTO: ReferenceDTO, keys: { id: 'referenceId' } },
    });
    const resolver = new R();
    // @ts-ignore
    const result = await resolver.relationReference(dto);
    return expect(result).toEqual({ __typename: 'Relation', id: dto.referenceId });
  });
});
