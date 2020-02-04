/* eslint-disable @typescript-eslint/no-unused-vars */
import * as nestGraphql from '@nestjs/graphql';
import { ResolverProperty } from '../../src/decorators';
import * as resolverDecorator from '../../src/decorators/resolver-method.decorator';
import { AdvancedOptions, ReturnTypeFunc, ReturnTypeFuncValue } from '../../src/external/type-graphql.types';

describe('ResolverProperty decorator', (): void => {
  const resolverMethodSpy = jest.spyOn(resolverDecorator, 'ResolverMethod');
  const propertySpy = jest.spyOn(nestGraphql, 'ResolveProperty');

  beforeEach(() => jest.clearAllMocks());

  function createTestResolver(
    name: string,
    typeFunc: ReturnTypeFunc,
    options?: AdvancedOptions,
    ...opts: resolverDecorator.ResolverMethodOpts[]
  ): void {
    // @ts-ignore
    class TestResolver {
      @ResolverProperty(name, typeFunc, options, ...opts)
      method(): boolean {
        return true;
      }
    }
  }

  function assertMutationCall(
    callNo: number,
    name: string,
    returnType: ReturnTypeFuncValue,
    advancedOpts: AdvancedOptions,
  ) {
    const [n, rt, ao] = propertySpy.mock.calls[callNo]!;
    expect(n).toEqual(name);
    expect(rt ? rt() : null).toEqual(returnType);
    expect(ao).toEqual(advancedOpts);
  }

  function assertResolverMethodCall(callNo: number, ...opts: resolverDecorator.ResolverMethodOpts[]) {
    expect(resolverMethodSpy).toHaveBeenNthCalledWith(callNo + 1, ...opts);
  }

  it('should call ResolveProperty with the correct mutation arguments', () => {
    const opts: resolverDecorator.ResolverMethodOpts[] = [{}];
    createTestResolver('test', () => Boolean, { nullable: true }, ...opts);
    assertMutationCall(0, 'test', Boolean, { nullable: true });
  });

  it('should call ResolverMethod with the correct options', () => {
    const opts: resolverDecorator.ResolverMethodOpts[] = [{}];
    createTestResolver('test', () => Boolean, { nullable: true }, ...opts);
    assertResolverMethodCall(0, ...opts);
  });

  it('should not call ResolverMethod if disabled is true', () => {
    const opts: resolverDecorator.ResolverMethodOpts[] = [{ disabled: true }];
    createTestResolver('test', () => Boolean, { nullable: true }, ...opts);
    expect(propertySpy).toBeCalledTimes(0);
    expect(resolverMethodSpy).toBeCalledTimes(0);
  });
});
