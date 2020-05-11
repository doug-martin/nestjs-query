import { Class, QueryService, getQueryServiceToken, AssemblerQueryService, AssemblerFactory } from '@nestjs-query/core';
import { Provider, Inject } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';
import { CRUDResolver, CRUDResolverOpts, FederationResolver, RelationsOpts } from './resolvers';

export type CRUDAutoResolverOpts<DTO, Entity, C, U> = CRUDResolverOpts<DTO, C, U> & {
  DTOClass: Class<DTO>;
  EntityClass: Class<Entity>;
};

export type FederatedAutoResolverOpts<DTO, Service> = RelationsOpts & {
  type: 'federated';
  DTOClass: Class<DTO>;
  Service: Class<Service>;
};

export type AutoResolverOpts<DTO, EntityOrService, C, U> =
  | CRUDAutoResolverOpts<DTO, EntityOrService, C, U>
  | FederatedAutoResolverOpts<DTO, EntityOrService>;

const isFederatedResolverOpts = <DTO, EntityOrService, C, U>(
  opts: AutoResolverOpts<DTO, EntityOrService, C, U>,
): opts is FederatedAutoResolverOpts<DTO, EntityOrService> => {
  return 'type' in opts && opts.type === 'federated';
};

const getResolverToken = <DTO>(DTOClass: Class<DTO>): string => `${DTOClass.name}AutoResolver`;
const getFederatedResolverToken = <DTO>(DTOClass: Class<DTO>): string => `${DTOClass.name}FederatedAutoResolver`;

function createFederatedResolver<DTO, Service>(resolverOpts: FederatedAutoResolverOpts<DTO, Service>): Provider {
  const { DTOClass } = resolverOpts;

  @Resolver(() => DTOClass)
  class AutoResolver extends FederationResolver(DTOClass, resolverOpts) {
    constructor(@Inject(resolverOpts.Service) service: QueryService<DTO>) {
      super(service);
    }
  }
  // need to set class name so DI works properly
  Object.defineProperty(AutoResolver, 'name', { value: getFederatedResolverToken(DTOClass), writable: false });

  return AutoResolver;
}

function createResolver<DTO, Entity, C, U>(resolverOpts: AutoResolverOpts<DTO, Entity, C, U>): Provider {
  if (isFederatedResolverOpts(resolverOpts)) {
    return createFederatedResolver(resolverOpts);
  }
  const { DTOClass, EntityClass } = resolverOpts;

  class Service extends AssemblerQueryService<DTO, Entity> {
    constructor(service: QueryService<Entity>) {
      const assembler = AssemblerFactory.getAssembler(DTOClass, EntityClass);
      super(assembler, service);
    }
  }

  @Resolver(() => DTOClass)
  class AutoResolver extends CRUDResolver(DTOClass, resolverOpts) {
    constructor(@Inject(getQueryServiceToken(EntityClass)) service: QueryService<Entity>) {
      super(new Service(service));
    }
  }

  // need to set class name so DI works properly
  Object.defineProperty(AutoResolver, 'name', { value: getResolverToken(DTOClass), writable: false });

  return AutoResolver;
}

export const createResolvers = (opts: AutoResolverOpts<unknown, unknown, unknown, unknown>[]): Provider[] => {
  return opts.map((opt) => createResolver(opt));
};
