import {
  Class,
  QueryService,
  InjectAssemblerQueryService,
  InjectQueryService,
  AssemblerFactory,
  AssemblerQueryService,
} from '@nestjs-query/core';
import { Assembler } from '@nestjs-query/core/src';
import { Provider, Inject } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';
import { CRUDResolver, CRUDResolverOpts, FederationResolver, RelationsOpts } from './resolvers';

type CRUDAutoResolverOpts<DTO, C, U> = CRUDResolverOpts<DTO, C, U> & {
  DTOClass: Class<DTO>;
};

export type EntityCRUDAutoResolverOpts<DTO, Entity, C, U> = CRUDAutoResolverOpts<DTO, C, U> & {
  EntityClass: Class<Entity>;
};

export type AssemblerCRUDAutoResolverOpts<DTO, Assembler, C, U> = CRUDAutoResolverOpts<DTO, C, U> & {
  AssemblerClass: Class<Assembler>;
};

export type ServiceCRUDAutoResolverOpts<DTO, QueryService, C, U> = CRUDAutoResolverOpts<DTO, C, U> & {
  ServiceClass: Class<QueryService>;
};

export type FederatedAutoResolverOpts<DTO, Service> = RelationsOpts & {
  type: 'federated';
  DTOClass: Class<DTO>;
  Service: Class<Service>;
};

export type AutoResolverOpts<DTO, EntityServiceOrAssemler, C, U> =
  | EntityCRUDAutoResolverOpts<DTO, EntityServiceOrAssemler, C, U>
  | AssemblerCRUDAutoResolverOpts<DTO, EntityServiceOrAssemler, C, U>
  | ServiceCRUDAutoResolverOpts<DTO, EntityServiceOrAssemler, C, U>
  | FederatedAutoResolverOpts<DTO, EntityServiceOrAssemler>;

export const isFederatedResolverOpts = <DTO, MaybeService, C, U>(
  opts: AutoResolverOpts<DTO, MaybeService, C, U>,
): opts is FederatedAutoResolverOpts<DTO, MaybeService> => {
  return 'type' in opts && opts.type === 'federated';
};

export const isAssemblerCRUDAutoResolverOpts = <DTO, MaybeAssembler, C, U, Assembler>(
  opts: AutoResolverOpts<DTO, MaybeAssembler, C, U>,
): opts is AssemblerCRUDAutoResolverOpts<DTO, MaybeAssembler, C, U> => {
  return 'DTOClass' in opts && 'AssemblerClass' in opts;
};

export const isServiceCRUDAutoResolverOpts = <DTO, MaybeService, C, U>(
  opts: AutoResolverOpts<DTO, MaybeService, C, U>,
): opts is ServiceCRUDAutoResolverOpts<DTO, MaybeService, C, U> => {
  return 'DTOClass' in opts && 'ServiceClass' in opts;
};

const getResolverToken = <DTO>(DTOClass: Class<DTO>): string => `${DTOClass.name}AutoResolver`;
const getFederatedResolverToken = <DTO>(DTOClass: Class<DTO>): string => `${DTOClass.name}FederatedAutoResolver`;

function createFederatedResolver<DTO, Service>(resolverOpts: FederatedAutoResolverOpts<DTO, Service>): Provider {
  const { DTOClass } = resolverOpts;

  @Resolver(() => DTOClass)
  class AutoResolver extends FederationResolver(DTOClass, resolverOpts) {
    constructor(@Inject(resolverOpts.Service) readonly service: QueryService<DTO>) {
      super(service);
    }
  }
  // need to set class name so DI works properly
  Object.defineProperty(AutoResolver, 'name', { value: getFederatedResolverToken(DTOClass), writable: false });

  return AutoResolver;
}

function createEntityAutoResolver<DTO, Entity, C, U>(
  resolverOpts: EntityCRUDAutoResolverOpts<DTO, Entity, C, U>,
): Provider {
  const { DTOClass, EntityClass } = resolverOpts;
  class Service extends AssemblerQueryService<DTO, Entity> {
    constructor(service: QueryService<Entity>) {
      const assembler = AssemblerFactory.getAssembler(DTOClass, EntityClass);
      super(assembler, service);
    }
  }
  @Resolver(() => DTOClass)
  class AutoResolver extends CRUDResolver(DTOClass, resolverOpts) {
    constructor(@InjectQueryService(EntityClass) service: QueryService<Entity>) {
      super(new Service(service));
    }
  }
  // need to set class name so DI works properly
  Object.defineProperty(AutoResolver, 'name', { value: getResolverToken(DTOClass), writable: false });
  return AutoResolver;
}

function createAssemblerAutoResolver<DTO, Asmblr, C, U>(
  resolverOpts: AssemblerCRUDAutoResolverOpts<DTO, Asmblr, C, U>,
): Provider {
  const { DTOClass, AssemblerClass } = resolverOpts;
  @Resolver(() => DTOClass)
  class AutoResolver extends CRUDResolver(DTOClass, resolverOpts) {
    constructor(
      @InjectAssemblerQueryService((AssemblerClass as unknown) as Class<Assembler<DTO, unknown>>)
      service: QueryService<DTO>,
    ) {
      super(service);
    }
  }
  // need to set class name so DI works properly
  Object.defineProperty(AutoResolver, 'name', { value: getResolverToken(DTOClass), writable: false });
  return AutoResolver;
}

function createServiceAutoResolver<DTO, Service, C, U>(
  resolverOpts: ServiceCRUDAutoResolverOpts<DTO, Service, C, U>,
): Provider {
  const { DTOClass, ServiceClass } = resolverOpts;
  @Resolver(() => DTOClass)
  class AutoResolver extends CRUDResolver(DTOClass, resolverOpts) {
    constructor(@Inject(ServiceClass) service: QueryService<DTO>) {
      super(service);
    }
  }
  // need to set class name so DI works properly
  Object.defineProperty(AutoResolver, 'name', { value: getResolverToken(DTOClass), writable: false });
  return AutoResolver;
}

function createResolver<DTO, EntityServiceOrAssembler, C, U>(
  resolverOpts: AutoResolverOpts<DTO, EntityServiceOrAssembler, C, U>,
): Provider {
  if (isFederatedResolverOpts(resolverOpts)) {
    return createFederatedResolver(resolverOpts);
  }
  if (isAssemblerCRUDAutoResolverOpts(resolverOpts)) {
    return createAssemblerAutoResolver(resolverOpts);
  }
  if (isServiceCRUDAutoResolverOpts(resolverOpts)) {
    return createServiceAutoResolver(resolverOpts);
  }
  return createEntityAutoResolver(resolverOpts);
}

export const createResolvers = (opts: AutoResolverOpts<unknown, unknown, unknown, unknown>[]): Provider[] => {
  return opts.map((opt) => createResolver(opt));
};
