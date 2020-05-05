import { Class, QueryService, getQueryServiceToken, AssemblerQueryService, AssemblerFactory } from '@nestjs-query/core';
import { Provider, Inject } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';
import { CRUDResolver, CRUDResolverOpts } from './resolvers';

export interface AutoResolverOpts<DTO, Entity> extends CRUDResolverOpts<DTO> {
  DTOClass: Class<DTO>;
  EntityClass: Class<Entity>;
}

const getResolverToken = <DTO>(DTOClass: Class<DTO>): string => `${DTOClass.name}AutoResolver`;

function createResolver<DTO, Entity>(resolverOpts: AutoResolverOpts<DTO, Entity>): Provider {
  const { DTOClass, EntityClass } = resolverOpts;

  class Service extends AssemblerQueryService<DTO, Entity> {
    constructor(service: QueryService<Entity>) {
      const assembler = AssemblerFactory.getAssembler(DTOClass, EntityClass);
      super(assembler, service);
    }
  }

  @Resolver(() => DTOClass)
  class AutoResolver extends CRUDResolver(DTOClass, resolverOpts) {
    constructor(@Inject(getQueryServiceToken(resolverOpts.EntityClass)) service: QueryService<Entity>) {
      super(new Service(service));
    }
  }
  // need to set class name so DI works properly
  Object.defineProperty(AutoResolver, 'name', { value: getResolverToken(DTOClass), writable: false });

  return AutoResolver;
}

export const createResolvers = (opts: AutoResolverOpts<unknown, unknown>[]): Provider[] => {
  return opts.map((opt) => createResolver(opt));
};
