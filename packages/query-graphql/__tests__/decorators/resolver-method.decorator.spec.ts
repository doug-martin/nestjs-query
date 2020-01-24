/* eslint-disable @typescript-eslint/no-unused-vars */
import * as nest from '@nestjs/common';
import { Class } from '@nestjs-query/core';
import { ResolverMethod, ResolverMethodOpts } from '../../src/decorators/resolver-method.decorator';

describe('ResolverMethod decorator', (): void => {
  const useGuardsSpy = jest.spyOn(nest, 'UseGuards');
  const useInterceptorsSpy = jest.spyOn(nest, 'UseInterceptors');
  const usePipesSpy = jest.spyOn(nest, 'UsePipes');
  const useFiltersSpy = jest.spyOn(nest, 'UseFilters');

  function createCanActivate(): Class<nest.CanActivate> {
    return class implements nest.CanActivate {
      canActivate(context: nest.ExecutionContext): boolean {
        return false;
      }
    };
  }

  function createInterceptor(): Class<nest.NestInterceptor<any, any>> {
    return class implements nest.NestInterceptor<any, any> {
      intercept(context: nest.ExecutionContext, next: nest.CallHandler<any>) {
        return next.handle();
      }
    };
  }

  function createPipe(): Class<nest.PipeTransform<any, any>> {
    return class implements nest.PipeTransform<any, any> {
      transform(t: any) {
        return t;
      }
    };
  }

  function createFilter(): Class<nest.ExceptionFilter<any>> {
    return class implements nest.ExceptionFilter<any> {
      catch(t: any) {
        return t;
      }
    };
  }

  function createTestResolver(...opts: ResolverMethodOpts[]): void {
    // @ts-ignore
    class TestResolver {
      @ResolverMethod(...opts)
      method(): boolean {
        return true;
      }
    }
  }

  describe('guards option', () => {
    it('should call UseGuards with the provided guards', () => {
      const FakeCanActivate = createCanActivate();
      const opts = [{ guards: [FakeCanActivate] }];
      createTestResolver(...opts);
      expect(useGuardsSpy).toBeCalledWith(FakeCanActivate);
      expect(useInterceptorsSpy).toBeCalledWith();
      expect(usePipesSpy).toBeCalledWith();
      expect(useFiltersSpy).toBeCalledWith();
    });

    it('should call UseGuards with a unique set of guards', () => {
      const FakeCanActivate1 = createCanActivate();
      const FakeCanActivate2 = createCanActivate();
      const opts = [{ guards: [FakeCanActivate1] }, { guards: [FakeCanActivate1, FakeCanActivate2] }];
      createTestResolver(...opts);
      expect(useGuardsSpy).toBeCalledWith(FakeCanActivate1, FakeCanActivate2);
      expect(useInterceptorsSpy).toBeCalledWith();
      expect(usePipesSpy).toBeCalledWith();
      expect(useFiltersSpy).toBeCalledWith();
    });
  });

  describe('interceptors option', () => {
    it('should call UseGuards with the provided guards', () => {
      const FakeInterceptor = createInterceptor();
      const opts = [{ interceptors: [FakeInterceptor] }];
      createTestResolver(...opts);
      expect(useGuardsSpy).toBeCalledWith();
      expect(useInterceptorsSpy).toBeCalledWith(FakeInterceptor);
      expect(usePipesSpy).toBeCalledWith();
      expect(useFiltersSpy).toBeCalledWith();
    });

    it('should call UseGuards with a unique set of guards', () => {
      const FakeInterceptor1 = createInterceptor();
      const FakeInterceptor2 = createInterceptor();
      const opts = [{ interceptors: [FakeInterceptor1] }, { interceptors: [FakeInterceptor1, FakeInterceptor2] }];
      createTestResolver(...opts);
      expect(useGuardsSpy).toBeCalledWith();
      expect(useInterceptorsSpy).toBeCalledWith(FakeInterceptor1, FakeInterceptor2);
      expect(usePipesSpy).toBeCalledWith();
      expect(useFiltersSpy).toBeCalledWith();
    });
  });

  describe('pipes option', () => {
    it('should call UseGuards with the provided guards', () => {
      const FakePipe = createPipe();
      const opts = [{ pipes: [FakePipe] }];
      createTestResolver(...opts);
      expect(useGuardsSpy).toBeCalledWith();
      expect(useInterceptorsSpy).toBeCalledWith();
      expect(usePipesSpy).toBeCalledWith(FakePipe);
      expect(useFiltersSpy).toBeCalledWith();
    });

    it('should call UseGuards with a unique set of guards', () => {
      const FakePipe1 = createPipe();
      const FakePipe2 = createPipe();
      const opts = [{ pipes: [FakePipe1] }, { pipes: [FakePipe1, FakePipe2] }];
      createTestResolver(...opts);
      expect(useGuardsSpy).toBeCalledWith();
      expect(useInterceptorsSpy).toBeCalledWith();
      expect(usePipesSpy).toBeCalledWith(FakePipe1, FakePipe2);
      expect(useFiltersSpy).toBeCalledWith();
    });
  });

  describe('filters option', () => {
    it('should call UseGuards with the provided guards', () => {
      const FakePipe = createFilter();
      const opts = [{ filters: [FakePipe] }];
      createTestResolver(...opts);
      expect(useGuardsSpy).toBeCalledWith();
      expect(useInterceptorsSpy).toBeCalledWith();
      expect(usePipesSpy).toBeCalledWith();
      expect(useFiltersSpy).toBeCalledWith(FakePipe);
    });

    it('should call UseGuards with a unique set of guards', () => {
      const FakeFilter1 = createFilter();
      const FakeFilter2 = createFilter();
      const opts = [{ filters: [FakeFilter1] }, { filters: [FakeFilter1, FakeFilter2] }];
      createTestResolver(...opts);
      expect(useGuardsSpy).toBeCalledWith();
      expect(useInterceptorsSpy).toBeCalledWith();
      expect(usePipesSpy).toBeCalledWith();
      expect(useFiltersSpy).toBeCalledWith(FakeFilter1, FakeFilter2);
    });
  });
});
