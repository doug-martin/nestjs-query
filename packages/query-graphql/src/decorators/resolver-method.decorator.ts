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
  interceptors?: NestInterceptor<unknown, unknown>[];
  pipes?: PipeTransform<unknown, unknown>[];
  filters?: ExceptionFilter<unknown>[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createSetArray = <T>(...arrs: T[][]): T[] => {
  const set: Set<T> = new Set(arrs.reduce<T[]>((acc: T[], arr: T[]): T[] => [...acc, ...arr], []));
  console.log([...set]);
  return [...set];
};

export const ResolverMethod = (...opts: ResolverMethodOptions[]) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T>(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): void => {
    UseGuards(...createSetArray(...opts.map(o => o.guards ?? [])))(target, propertyKey, descriptor);
    UseInterceptors(...createSetArray(...opts.map(o => o.interceptors ?? [])))(target, propertyKey, descriptor);
    UsePipes(...createSetArray(...opts.map(o => o.pipes ?? [])))(target, propertyKey, descriptor);
    UseFilters(...createSetArray(...opts.map(o => o.filters ?? [])))(target, propertyKey, descriptor);
  };
};
