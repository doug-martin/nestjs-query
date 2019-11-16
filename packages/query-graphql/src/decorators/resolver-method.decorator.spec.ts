import * as nest from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { CanActivate } from '@nestjs/common/interfaces/features/can-activate.interface';
import { ResolverMethod } from './resolver-method.decorator';

describe('ResolverMethod decorator', (): void => {
  const useGuardsMock = jest.spyOn(nest, 'UseGuards');
  const useInterceptorsMock = jest.spyOn(nest, 'UseInterceptors');
  const usePipesMock = jest.spyOn(nest, 'UsePipes');
  const useFiltersMock = jest.spyOn(nest, 'UseFilters');

  class FakeCanActivate implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      return false;
    }
  }

  it('should call UseGuards with with the provided guards', () => {
    const opts = {
      guards: [FakeCanActivate],
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // @ts-ignore
    class TestResolver {
      @ResolverMethod(opts)
      method(): void {
        return
      }
    }

    expect(useGuardsMock).toBeCalledWith(FakeCanActivate);
    expect(useInterceptorsMock).toBeCalledWith();
    expect(usePipesMock).toBeCalledWith();
    expect(useFiltersMock).toBeCalledWith();
  });
});
