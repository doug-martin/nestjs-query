import {
  Class,
  QueryService,
  InjectAssemblerQueryService,
  InjectQueryService,
  AssemblerFactory,
  AssemblerQueryService,
  Assembler,
} from '@nestjs-query/core';
import { Provider, Inject } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { InjectPubSub } from '../decorators';
import { CRUDResolver, CRUDResolverOpts, FederationResolver } from '../resolvers';
import { PagingStrategies } from '../types/query/paging';

export type CRUDAutoResolverOpts<DTO, C, U, R, PS extends PagingStrategies> = CRUDResolverOpts<DTO, C, U, R, PS> & {
  DTOClass: Class<DTO>;
};

export type EntityCRUDAutoResolverOpts<DTO, Entity, C, U, R, PS extends PagingStrategies> = CRUDAutoResolverOpts<
  DTO,
  C,
  U,
  R,
  PS
> & {
  EntityClass: Class<Entity>;
};

export type AssemblerCRUDAutoResolverOpts<DTO, Assembler, C, U, R, PS extends PagingStrategies> = CRUDAutoResolverOpts<
  DTO,
  C,
  U,
  R,
  PS
> & {
  AssemblerClass: Class<Assembler>;
};

export type ServiceCRUDAutoResolverOpts<DTO, QueryService, C, U, R, PS extends PagingStrategies> = CRUDAutoResolverOpts<
  DTO,
  C,
  U,
  R,
  PS
> & {
  ServiceClass: Class<QueryService>;
};

export type FederatedAutoResolverOpts<DTO, Service> = {
  type: 'federated';
  DTOClass: Class<DTO>;
  Service: Class<Service>;
};

export type AutoResolverOpts<DTO, EntityServiceOrAssembler, C, U, R, PS extends PagingStrategies> =
  | EntityCRUDAutoResolverOpts<DTO, EntityServiceOrAssembler, C, U, R, PS>
  | AssemblerCRUDAutoResolverOpts<DTO, EntityServiceOrAssembler, C, U, R, PS>
  | ServiceCRUDAutoResolverOpts<DTO, EntityServiceOrAssembler, C, U, R, PS>
  | FederatedAutoResolverOpts<DTO, EntityServiceOrAssembler>;

export const isFederatedResolverOpts = <DTO, MaybeService, C, U, R, PS extends PagingStrategies>(
  opts: AutoResolverOpts<DTO, MaybeService, C, U, R, PS>,
): opts is FederatedAutoResolverOpts<DTO, MaybeService> => 'type' in opts && opts.type === 'federated';

export const isAssemblerCRUDAutoResolverOpts = <DTO, MaybeAssembler, C, U, R, PS extends PagingStrategies>(
  opts: AutoResolverOpts<DTO, MaybeAssembler, C, U, R, PS>,
): opts is AssemblerCRUDAutoResolverOpts<DTO, MaybeAssembler, C, U, R, PS> =>
  'DTOClass' in opts && 'AssemblerClass' in opts;

export const isServiceCRUDAutoResolverOpts = <DTO, MaybeService, C, U, R, PS extends PagingStrategies>(
  opts: AutoResolverOpts<DTO, MaybeService, C, U, R, PS>,
): opts is ServiceCRUDAutoResolverOpts<DTO, MaybeService, C, U, R, PS> => 'DTOClass' in opts && 'ServiceClass' in opts;

const getResolverToken = <DTO>(DTOClass: Class<DTO>): string => `${DTOClass.name}AutoResolver`;
const getFederatedResolverToken = <DTO>(DTOClass: Class<DTO>): string => `${DTOClass.name}FederatedAutoResolver`;

function createFederatedResolver<DTO, Service>(resolverOpts: FederatedAutoResolverOpts<DTO, Service>): Provider {
  const { DTOClass } = resolverOpts;

  @Resolver(() => DTOClass)
  class AutoResolver extends FederationResolver(DTOClass) {
    constructor(
      @Inject(resolverOpts.Service) readonly service: QueryService<DTO, unknown, unknown>,
      @InjectPubSub() readonly pubSub: PubSub,
    ) {
      super(service);
    }
  }
  // need to set class name so DI works properly
  Object.defineProperty(AutoResolver, 'name', { value: getFederatedResolverToken(DTOClass), writable: false });

  return AutoResolver;
}

function createEntityAutoResolver<DTO, Entity, C, U, R, PS extends PagingStrategies>(
  resolverOpts: EntityCRUDAutoResolverOpts<DTO, Entity, C, U, R, PS>,
): Provider {
  const { DTOClass, EntityClass } = resolverOpts;
  class Service extends AssemblerQueryService<DTO, Entity, C, C, U, U> {
    constructor(service: QueryService<Entity, C, U>) {
      const assembler = AssemblerFactory.getAssembler<DTO, Entity, C, C, U, U>(DTOClass, EntityClass);
      super(assembler, service);
    }
  }
  @Resolver(() => DTOClass)
  class AutoResolver extends CRUDResolver(DTOClass, resolverOpts) {
    constructor(
      @InjectQueryService(EntityClass) service: QueryService<Entity, C, U>,
      @InjectPubSub() readonly pubSub: PubSub,
    ) {
      super(new Service(service));
    }
  }
  // need to set class name so DI works properly
  Object.defineProperty(AutoResolver, 'name', { value: getResolverToken(DTOClass), writable: false });
  return AutoResolver;
}

function createAssemblerAutoResolver<DTO, Asmblr, C, U, R, PS extends PagingStrategies>(
  resolverOpts: AssemblerCRUDAutoResolverOpts<DTO, Asmblr, C, U, R, PS>,
): Provider {
  const { DTOClass, AssemblerClass } = resolverOpts;
  @Resolver(() => DTOClass)
  class AutoResolver extends CRUDResolver(DTOClass, resolverOpts) {
    constructor(
      @InjectAssemblerQueryService(AssemblerClass as unknown as Class<Assembler<DTO, unknown, C, unknown, U, unknown>>)
      service: QueryService<DTO, C, U>,
      @InjectPubSub() readonly pubSub: PubSub,
    ) {
      super(service);
    }
  }
  // need to set class name so DI works properly
  Object.defineProperty(AutoResolver, 'name', { value: getResolverToken(DTOClass), writable: false });
  return AutoResolver;
}

function createServiceAutoResolver<DTO, Service, C, U, R, PS extends PagingStrategies>(
  resolverOpts: ServiceCRUDAutoResolverOpts<DTO, Service, C, U, R, PS>,
): Provider {
  const { DTOClass, ServiceClass } = resolverOpts;
  @Resolver(() => DTOClass)
  class AutoResolver extends CRUDResolver(DTOClass, resolverOpts) {
    constructor(@Inject(ServiceClass) service: QueryService<DTO, C, U>, @InjectPubSub() readonly pubSub: PubSub) {
      super(service);
    }
  }
  // need to set class name so DI works properly
  Object.defineProperty(AutoResolver, 'name', { value: getResolverToken(DTOClass), writable: false });
  return AutoResolver;
}

function createResolver<DTO, EntityServiceOrAssembler, C, U, R, PS extends PagingStrategies>(
  resolverOpts: AutoResolverOpts<DTO, EntityServiceOrAssembler, C, U, R, PS>,
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

export const createResolvers = (
  opts: AutoResolverOpts<unknown, unknown, unknown, unknown, unknown, PagingStrategies>[],
): Provider[] => opts.map((opt) => createResolver(opt));
