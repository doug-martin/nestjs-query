/* eslint-disable @typescript-eslint/no-unused-vars */
import { Class } from '@nestjs-query/core';
import * as nestGraphql from '@nestjs/graphql';
import { ResolveFieldOptions, ReturnTypeFunc } from '@nestjs/graphql';
import { ResolverField } from '../../src/decorators';
import * as resolverDecorator from '../../src/decorators/resolver-method.decorator';

describe('ResolverField decorator', (): void => {
  const resolverMethodSpy = jest.spyOn(resolverDecorator, 'ResolverMethod');
  const propertySpy = jest.spyOn(nestGraphql, 'ResolveField');

  beforeEach(() => jest.clearAllMocks());

  function createTestResolver(
    name: string,
    typeFunc: ReturnTypeFunc,
    options?: ResolveFieldOptions,
    ...opts: resolverDecorator.ResolverMethodOpts[]
  ): Class<unknown> {
    class TestResolver {
      @ResolverField(name, typeFunc, options, ...opts)
      method(): boolean {
        return true;
      }
    }
    return TestResolver;
  }

  it('should call ResolveField with the correct mutation arguments', () => {
    const opts: resolverDecorator.ResolverMethodOpts[] = [{}];
    createTestResolver('test', () => Boolean, { nullable: true }, ...opts);
    const [n, rt, ao] = propertySpy.mock.calls[0]!;
    expect(n).toBe('test');
    expect(rt ? rt() : null).toEqual(Boolean);
    expect(ao).toEqual({ nullable: true });
  });

  it('should call ResolverMethod with the correct options', () => {
    const opts: resolverDecorator.ResolverMethodOpts[] = [{}];
    createTestResolver('test', () => Boolean, { nullable: true }, ...opts);
    expect(resolverMethodSpy).toHaveBeenNthCalledWith(1, ...opts);
  });

  it('should not call ResolverMethod if disabled is true', () => {
    const opts: resolverDecorator.ResolverMethodOpts[] = [{ disabled: true }];
    createTestResolver('test', () => Boolean, { nullable: true }, ...opts);
    expect(propertySpy).toHaveBeenCalledTimes(0);
    expect(resolverMethodSpy).toHaveBeenCalledTimes(0);
  });
});
