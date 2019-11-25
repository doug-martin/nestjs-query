import { Type } from '@nestjs/common';
import { ArgsType, ObjectType } from 'type-graphql';
import { GraphQLConnection, GraphQLQuery, StaticGraphQLConnectionType, StaticGraphQLQueryType } from '../../types';

export type ReadResolverTypesOpts = {
  typeName?: string;
};

export type ReadResolverTypes<DTO> = {
  QueryType: StaticGraphQLQueryType<DTO>;
  ConnectionType: StaticGraphQLConnectionType<DTO>;
};

export function readResolverTypesFactory<DTO>(
  DTOClass: Type<DTO>,
  opts: ReadResolverTypesOpts,
): ReadResolverTypes<DTO> {
  const baseName = opts.typeName ?? DTOClass.name;

  @ArgsType()
  class QueryType extends GraphQLQuery(DTOClass) {}

  @ObjectType(`${baseName}Connection`)
  class ConnectionType extends GraphQLConnection(DTOClass) {}

  return {
    QueryType,
    ConnectionType,
  };
}
