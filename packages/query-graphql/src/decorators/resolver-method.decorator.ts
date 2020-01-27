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

/**
 * Options for resolver methods.
 */
export interface ResolverMethodOpts {
  /** Set to true to disable the endpoint */
  disabled?: boolean;
  /** An array of `nestjs` guards to apply to a graphql endpoint */
  guards?: Class<CanActivate>[];
  /** An array of `nestjs` interceptors to apply to a graphql endpoint */
  interceptors?: Class<NestInterceptor<any, any>>[];
  /** An array of `nestjs` pipes to apply to a graphql endpoint */
  pipes?: Class<PipeTransform<any, any>>[];
  /** An array of `nestjs` error filters to apply to a graphql endpoint */
  filters?: Class<ExceptionFilter<any>>[];
}

/**
 * @internal
 * Creates a unique set of items.
 * @param arrs - An array of arrays to de duplicate.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createSetArray<T>(...arrs: T[][]): T[] {
  const set: Set<T> = new Set(arrs.reduce<T[]>((acc: T[], arr: T[]): T[] => [...acc, ...arr], []));
  return [...set];
}

/**
 * @internal
 * Returns true if any of the [[ResolverMethodOpts]] are disabled.
 * @param opts - The array of [[ResolverMethodOpts]] to check.
 */
export function isDisabled(opts: ResolverMethodOpts[]): boolean {
  return !!opts.find(o => o.disabled);
}

/**
 * @internal
 * Decorator for all ResolverMethods
 *
 * @param opts - the [[ResolverMethodOpts]] to apply.
 */
export function ResolverMethod(...opts: ResolverMethodOpts[]) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return <T>(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): void => {
    UseGuards(...createSetArray<Class<CanActivate>>(...opts.map(o => o.guards ?? [])))(target, propertyKey, descriptor);
    UseInterceptors(...createSetArray<Class<NestInterceptor>>(...opts.map(o => o.interceptors ?? [])))(
      target,
      propertyKey,
      descriptor,
    );
    UsePipes(...createSetArray<Class<PipeTransform>>(...opts.map(o => o.pipes ?? [])))(target, propertyKey, descriptor);
    UseFilters(...createSetArray<Class<ExceptionFilter>>(...opts.map(o => o.filters ?? [])))(
      target,
      propertyKey,
      descriptor,
    );
  };
}
