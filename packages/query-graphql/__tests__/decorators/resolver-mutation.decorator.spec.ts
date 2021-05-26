/* eslint-disable @typescript-eslint/no-unused-vars */
import { Class } from '@nestjs-query/core';
import * as nestGraphql from '@nestjs/graphql';
import { ReturnTypeFunc, MutationOptions } from '@nestjs/graphql';
import { ResolverMutation } from '../../src/decorators';
import * as resolverDecorator from '../../src/decorators/resolver-method.decorator';

describe('ResolverMutation decorator', (): void => {
  const resolverMethodSpy = jest.spyOn(resolverDecorator, 'ResolverMethod');
  const mutationSpy = jest.spyOn(nestGraphql, 'Mutation');

  beforeEach(() => jest.clearAllMocks());

  function createTestResolver(
    typeFunc: ReturnTypeFunc,
    options?: MutationOptions,
    ...opts: resolverDecorator.ResolverMethodOpts[]
  ): Class<unknown> {
    class TestResolver {
      @ResolverMutation(typeFunc, options, ...opts)
      method(): boolean {
        return true;
      }
    }
    return TestResolver;
  }

  it('should call Mutation with the correct mutation arguments', () => {
    const opts: resolverDecorator.ResolverMethodOpts[] = [{}];
    createTestResolver(() => Boolean, { name: 'test' }, ...opts);

    const [rt, ao] = mutationSpy.mock.calls[0]!;
    expect(rt()).toEqual(Boolean);
    expect(ao).toEqual({ name: 'test' });
  });

  it('should call ResolverMethod with the correct options', () => {
    const opts: resolverDecorator.ResolverMethodOpts[] = [{}];
    createTestResolver(() => Boolean, { name: 'test' }, ...opts);
    expect(resolverMethodSpy).toHaveBeenNthCalledWith(1, ...opts);
  });

  it('should not call ResolverMethod if disabled is true', () => {
    const opts: resolverDecorator.ResolverMethodOpts[] = [{ disabled: true }];
    createTestResolver(() => Boolean, { name: 'test' }, ...opts);
    expect(mutationSpy).toHaveBeenCalledTimes(0);
    expect(resolverMethodSpy).toHaveBeenCalledTimes(0);
  });
});
