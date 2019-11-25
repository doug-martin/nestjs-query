/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CanActivate,
  ExceptionFilter,
  NestInterceptor,
  PipeTransform,
  Type,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';

export type ResolverMethodOptions = {
  disabled?: boolean;
  guards?: Type<CanActivate>[];
  interceptors?: Type<NestInterceptor<any, any>>[];
  pipes?: Type<PipeTransform<any, any>>[];
  filters?: Type<ExceptionFilter<any>>[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createSetArray<T>(...arrs: T[][]): T[] {
  const set: Set<T> = new Set(arrs.reduce<T[]>((acc: T[], arr: T[]): T[] => [...acc, ...arr], []));
  return [...set];
}

export function isDisabled(opts: ResolverMethodOptions[]): boolean {
  return !!opts.find(o => o.disabled);
}

export function ResolverMethod(...opts: ResolverMethodOptions[]) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T>(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): void => {
    UseGuards(...createSetArray<Type<CanActivate>>(...opts.map(o => o.guards ?? [])))(target, propertyKey, descriptor);
    UseInterceptors(...createSetArray<Type<NestInterceptor<any, any>>>(...opts.map(o => o.interceptors ?? [])))(
      target,
      propertyKey,
      descriptor,
    );
    UsePipes(...createSetArray<Type<PipeTransform<any, any>>>(...opts.map(o => o.pipes ?? [])))(
      target,
      propertyKey,
      descriptor,
    );
    UseFilters(...createSetArray<Type<ExceptionFilter<any>>>(...opts.map(o => o.filters ?? [])))(
      target,
      propertyKey,
      descriptor,
    );
  };
}
