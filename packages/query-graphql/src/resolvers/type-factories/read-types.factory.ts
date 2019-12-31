import { ArgsType, ObjectType } from 'type-graphql';
import { Class } from '@nestjs-query/core';
import { ConnectionType, QueryType, StaticConnectionType, StaticQueryType } from '../../types';

export type ReadResolverTypesOpts = {
  typeName?: string;
};

export type ReadResolverTypes<DTO> = {
  QueryType: StaticQueryType<DTO>;
  ConnectionType: StaticConnectionType<DTO>;
};

export function readResolverTypesFactory<DTO>(
  DTOClass: Class<DTO>,
  opts: ReadResolverTypesOpts,
): ReadResolverTypes<DTO> {
  const baseName = opts.typeName ?? DTOClass.name;

  @ArgsType()
  class QueryTypeImpl extends QueryType(DTOClass) {}

  @ObjectType(`${baseName}Connection`)
  class ConnectionTypeImpl extends ConnectionType(DTOClass) {}

  return {
    QueryType: QueryTypeImpl,
    ConnectionType: ConnectionTypeImpl,
  };
}
