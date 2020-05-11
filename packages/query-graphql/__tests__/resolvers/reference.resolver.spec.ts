import 'reflect-metadata';
import * as nestGraphql from '@nestjs/graphql';
import { instance, mock, when } from 'ts-mockito';
import { QueryService } from '@nestjs-query/core';
import * as decorators from '../../src/decorators';
import { ReferenceResolver } from '../../src';

const { ID, ObjectType } = nestGraphql;

@ObjectType('TestReference')
class TestReferenceDTO {
  @decorators.FilterableField(() => ID)
  id!: string;

  @decorators.FilterableField()
  stringField!: string;
}

describe('ReferenceResolver', () => {
  const resolveReferenceSpy = jest.spyOn(nestGraphql, 'ResolveReference');

  beforeEach(() => jest.clearAllMocks());

  class TestResolver extends ReferenceResolver(TestReferenceDTO, { key: 'id' }) {
    constructor(service: QueryService<TestReferenceDTO>) {
      super(service);
    }
  }

  function asserResolveReferenceCall() {
    expect(resolveReferenceSpy).toBeCalledTimes(1);
    expect(resolveReferenceSpy).toBeCalledWith();
  }

  it('should create a new resolver with a resolveReference method', () => {
    jest.clearAllMocks(); // reset
    const Resolver = ReferenceResolver(TestReferenceDTO, { key: 'id' });
    asserResolveReferenceCall();
    expect(Resolver.prototype.resolveReference).toBeInstanceOf(Function);
  });

  it('should return the original resolver if key is not provided', () => {
    jest.clearAllMocks(); // reset
    const Resolver = ReferenceResolver(TestReferenceDTO);
    expect(resolveReferenceSpy).not.toBeCalled();
    expect(Resolver.prototype.resolveReference).toBeUndefined();
  });

  describe('#resolveReference', () => {
    it('should call the service getById with the provided input', async () => {
      const mockService = mock<QueryService<TestReferenceDTO>>();
      const id = 'id-1';
      const output: TestReferenceDTO = {
        id,
        stringField: 'foo',
      };
      const resolver = new TestResolver(instance(mockService));
      when(mockService.getById(id)).thenResolve(output);
      // @ts-ignore
      const result = await resolver.resolveReference({ __type: 'TestReference', id });
      return expect(result).toEqual(output);
    });

    it('should reject if the id is not found', async () => {
      const mockService = mock<QueryService<TestReferenceDTO>>();
      const id = 'id-1';
      const output: TestReferenceDTO = {
        id,
        stringField: 'foo',
      };
      const resolver = new TestResolver(instance(mockService));
      when(mockService.getById(id)).thenResolve(output);
      // @ts-ignore
      return expect(resolver.resolveReference({ __type: 'TestReference' })).rejects.toThrow(
        'Unable to resolve reference, missing required key id for TestReference',
      );
    });
  });
});
