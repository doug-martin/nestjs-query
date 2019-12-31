/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CanActivate,
  ExceptionFilter,
  NestInterceptor,
  PipeTransform,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { Class } from '@nestjs-query/core';

export type ResolverMethodOptions = {
  disabled?: boolean;
  guards?: Class<CanActivate>[];
  interceptors?: Class<NestInterceptor<any, any>>[];
  pipes?: Class<PipeTransform<any, any>>[];
  filters?: Class<ExceptionFilter<any>>[];
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
    UseGuards(...createSetArray<Class<CanActivate>>(...opts.map(o => o.guards ?? [])))(target, propertyKey, descriptor);
    UseInterceptors(...createSetArray<Class<NestInterceptor<any, any>>>(...opts.map(o => o.interceptors ?? [])))(
      target,
      propertyKey,
      descriptor,
    );
    UsePipes(...createSetArray<Class<PipeTransform<any, any>>>(...opts.map(o => o.pipes ?? [])))(
      target,
      propertyKey,
      descriptor,
    );
    UseFilters(...createSetArray<Class<ExceptionFilter<any>>>(...opts.map(o => o.filters ?? [])))(
      target,
      propertyKey,
      descriptor,
    );
  };
}
