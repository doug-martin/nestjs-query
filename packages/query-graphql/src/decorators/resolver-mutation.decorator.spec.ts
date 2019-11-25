import * as nestGraphql from '@nestjs/graphql';
import { AdvancedOptions, ReturnTypeFunc, ReturnTypeFuncValue } from '../external/type-graphql.types';
import { ResolverMutation } from './resolver-mutation.decorator';
import * as resolverDecorator from './resolver-method.decorator';

describe('ResolverMutation decorator', (): void => {
  const resolverMethodSpy = jest.spyOn(resolverDecorator, 'ResolverMethod');
  const mutationSpy = jest.spyOn(nestGraphql, 'Mutation');

  beforeEach(() => jest.clearAllMocks());

  function createTestResolver(
    typeFunc: ReturnTypeFunc,
    options?: AdvancedOptions,
    ...opts: resolverDecorator.ResolverMethodOptions[]
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // @ts-ignore
    class TestResolver {
      @ResolverMutation(typeFunc, options, ...opts)
      method(): boolean {
        return true;
      }
    }
  }

  function assertMutationCall(callNo: number, returnType: ReturnTypeFuncValue, advancedOpts: AdvancedOptions) {
    const [rt, ao] = mutationSpy.mock.calls[callNo]!;
    expect(rt()).toEqual(returnType);
    expect(ao).toEqual(advancedOpts);
  }

  function assertResolverMethodCall(callNo: number, ...opts: resolverDecorator.ResolverMethodOptions[]) {
    expect(resolverMethodSpy).toHaveBeenNthCalledWith(callNo + 1, ...opts);
  }

  it('should call Mutation with the correct mutation arguments', () => {
    const opts: resolverDecorator.ResolverMethodOptions[] = [{}];
    createTestResolver(() => Boolean, { name: 'test' }, ...opts);
    assertMutationCall(0, Boolean, { name: 'test' });
  });

  it('should call ResolverMethod with the correct options', () => {
    const opts: resolverDecorator.ResolverMethodOptions[] = [{}];
    createTestResolver(() => Boolean, { name: 'test' }, ...opts);
    assertResolverMethodCall(0, ...opts);
  });

  it('should not call ResolverMethod if disabled is true', () => {
    const opts: resolverDecorator.ResolverMethodOptions[] = [{ disabled: true }];
    createTestResolver(() => Boolean, { name: 'test' }, ...opts);
    expect(mutationSpy).toBeCalledTimes(0);
    expect(resolverMethodSpy).toBeCalledTimes(0);
  });
});
