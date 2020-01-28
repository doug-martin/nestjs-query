/* eslint-disable @typescript-eslint/no-unused-vars */
import * as nestGraphql from '@nestjs/graphql';
import * as resolverDecorator from '../../src/decorators/resolver-method.decorator';
import { AdvancedOptions, ReturnTypeFunc, ReturnTypeFuncValue } from '../../src/external/type-graphql.types';
import { ResolverQuery } from '../../src/decorators';

describe('ResolverQuery decorator', (): void => {
  const resolverMethodSpy = jest.spyOn(resolverDecorator, 'ResolverMethod');
  const querySpy = jest.spyOn(nestGraphql, 'Query');

  beforeEach(() => jest.clearAllMocks());

  function createTestResolver(
    typeFunc: ReturnTypeFunc,
    options?: AdvancedOptions,
    ...opts: resolverDecorator.ResolverMethodOpts[]
  ): void {
    // @ts-ignore
    class TestResolver {
      @ResolverQuery(typeFunc, options, ...opts)
      method(): boolean {
        return true;
      }
    }
  }

  function assertQueryCall(callNo: number, returnType: ReturnTypeFuncValue, advancedOpts: AdvancedOptions) {
    const [rt, ao] = querySpy.mock.calls[callNo]!;
    expect(rt()).toEqual(returnType);
    expect(ao).toEqual(advancedOpts);
  }

  function assertResolverMethodCall(callNo: number, ...opts: resolverDecorator.ResolverMethodOpts[]) {
    expect(resolverMethodSpy).toHaveBeenNthCalledWith(callNo + 1, ...opts);
  }

  it('should call Query with the correct mutation arguments', () => {
    const opts: resolverDecorator.ResolverMethodOpts[] = [{}];
    createTestResolver(() => Boolean, { name: 'test' }, ...opts);
    assertQueryCall(0, Boolean, { name: 'test' });
  });

  it('should call ResolverMethod with the correct options', () => {
    const opts: resolverDecorator.ResolverMethodOpts[] = [{}];
    createTestResolver(() => Boolean, { name: 'test' }, ...opts);
    assertResolverMethodCall(0, ...opts);
  });

  it('should not call ResolverMethod if disabled is true', () => {
    const opts: resolverDecorator.ResolverMethodOpts[] = [{ disabled: true }];
    createTestResolver(() => Boolean, { name: 'test' }, ...opts);
    expect(querySpy).toBeCalledTimes(0);
    expect(resolverMethodSpy).toBeCalledTimes(0);
  });
});
