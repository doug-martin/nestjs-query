import { Field, ObjectType } from '@nestjs/graphql';
import { Class, Query } from '@nestjs-query/core';
import { QueryArgsType } from '../query';
import { PageInfoType } from './page-info.type';
import { EdgeType } from './edge.type';
import { getMetadataStorage } from '../../metadata';
import { UnregisteredObjectType } from '../type.errors';
import { createPager, QueryMany } from './pager';

export interface StaticConnectionType<DTO> {
  createFromPromise(
    queryMany: (query: Query<DTO>) => Promise<DTO[]>,
    query: QueryArgsType<DTO>,
  ): Promise<ConnectionType<DTO>>;
  new (): ConnectionType<DTO>;
}

export interface ConnectionType<TItem> {
  pageInfo: PageInfoType;
  edges: EdgeType<TItem>[];
}

export function ConnectionType<DTO>(TItemClass: Class<DTO>): StaticConnectionType<DTO> {
  const metadataStorage = getMetadataStorage();
  const existing = metadataStorage.getConnectionType(TItemClass);
  if (existing) {
    return existing;
  }
  const objMetadata = metadataStorage.getGraphqlObjectMetadata(TItemClass);
  if (!objMetadata) {
    throw new UnregisteredObjectType(TItemClass, 'Unable to make ConnectionType.');
  }
  const pager = createPager<DTO>();
  const E = EdgeType(TItemClass);
  const PIT = PageInfoType();
  @ObjectType(`${objMetadata.name}Connection`)
  class AbstractConnection implements ConnectionType<DTO> {
    static async createFromPromise(queryMany: QueryMany<DTO>, query: QueryArgsType<DTO>): Promise<AbstractConnection> {
      const { pageInfo, edges } = await pager.page(queryMany, query);
      return new AbstractConnection(
        // create the appropriate graphql instance
        new PIT(pageInfo.hasNextPage, pageInfo.hasPreviousPage, pageInfo.startCursor, pageInfo.endCursor),
        edges.map(({ node, cursor }) => new E(node, cursor)),
      );
    }

    constructor(pageInfo?: PageInfoType, edges?: EdgeType<DTO>[]) {
      this.pageInfo = pageInfo ?? { hasNextPage: false, hasPreviousPage: false };
      this.edges = edges ?? [];
    }

    @Field(() => PIT, { description: 'Paging information' })
    pageInfo!: PageInfoType;

    @Field(() => [E], { description: 'Array of edges.' })
    edges!: EdgeType<DTO>[];
  }
  metadataStorage.addConnectionType(TItemClass, AbstractConnection);
  return AbstractConnection;
}
