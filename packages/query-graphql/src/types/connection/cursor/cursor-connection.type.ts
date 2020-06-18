import { Field, ObjectType } from '@nestjs/graphql';
import { Class } from '@nestjs-query/core';
import { CursorQueryArgsType } from '../../query';
import { getMetadataStorage } from '../../../metadata';
import { UnregisteredObjectType } from '../../type.errors';
import { createPager, QueryMany } from './pager';
import { StaticConnection } from '../interfaces';
import { EdgeType } from './edge.type';
import { PageInfoType } from './page-info.type';

export type StaticCursorConnectionType<DTO> = StaticConnection<
  DTO,
  CursorQueryArgsType<DTO>,
  CursorConnectionType<DTO>
>;

export type CursorConnectionType<DTO> = {
  pageInfo: PageInfoType;
  edges: EdgeType<DTO>[];
};

export function CursorConnectionType<DTO>(TItemClass: Class<DTO>): StaticCursorConnectionType<DTO> {
  const metadataStorage = getMetadataStorage();
  const existing = metadataStorage.getConnectionType<DTO, StaticCursorConnectionType<DTO>>('cursor', TItemClass);
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
  class AbstractConnection implements CursorConnectionType<DTO> {
    static get resolveType() {
      return this;
    }

    static async createFromPromise(
      queryMany: QueryMany<DTO>,
      query: CursorQueryArgsType<DTO>,
    ): Promise<AbstractConnection> {
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
  metadataStorage.addConnectionType('cursor', TItemClass, AbstractConnection);
  return AbstractConnection;
}
