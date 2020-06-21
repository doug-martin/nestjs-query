import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Class } from '@nestjs-query/core';
import { NotImplementedException } from '@nestjs/common';
import { SkipIf } from '../../../decorators';
import { CursorQueryArgsType } from '../../query';
import { getMetadataStorage } from '../../../metadata';
import { UnregisteredObjectType } from '../../type.errors';
import { CountFn, createPager } from './pager';
import { Count, QueryMany, StaticConnection } from '../interfaces';
import { EdgeType } from './edge.type';
import { PageInfoType } from './page-info.type';

export type CursorConnectionOptions = {
  enableTotalCount?: boolean;
  connectionName?: string;
};

export type StaticCursorConnectionType<DTO> = StaticConnection<
  DTO,
  CursorQueryArgsType<DTO>,
  CursorConnectionType<DTO>
>;

export type CursorConnectionType<DTO> = {
  pageInfo: PageInfoType;
  edges: EdgeType<DTO>[];
  totalCount?: Promise<number>;
};

const DEFAULT_COUNT = () => Promise.reject(new NotImplementedException('totalCount not implemented'));

export function CursorConnectionType<DTO>(
  TItemClass: Class<DTO>,
  opts: CursorConnectionOptions = {},
): StaticCursorConnectionType<DTO> {
  const metadataStorage = getMetadataStorage();
  let { connectionName } = opts;
  if (!connectionName) {
    const objMetadata = metadataStorage.getGraphqlObjectMetadata(TItemClass);
    if (!objMetadata) {
      throw new UnregisteredObjectType(TItemClass, 'Unable to make ConnectionType.');
    }
    connectionName = `${objMetadata.name}Connection`;
  }
  const existing = metadataStorage.getConnectionType<DTO, StaticCursorConnectionType<DTO>>('cursor', connectionName);
  if (existing) {
    return existing;
  }

  const pager = createPager<DTO>();
  const E = EdgeType(TItemClass);
  const PIT = PageInfoType();
  @ObjectType(connectionName)
  class AbstractConnection implements CursorConnectionType<DTO> {
    static get resolveType() {
      return this;
    }

    static async createFromPromise(
      queryMany: QueryMany<DTO>,
      query: CursorQueryArgsType<DTO>,
      count?: Count<DTO>,
    ): Promise<AbstractConnection> {
      const { pageInfo, edges, totalCount } = await pager.page(queryMany, query, count ?? DEFAULT_COUNT);
      return new AbstractConnection(
        // create the appropriate graphql instance
        new PIT(pageInfo.hasNextPage, pageInfo.hasPreviousPage, pageInfo.startCursor, pageInfo.endCursor),
        edges.map(({ node, cursor }) => new E(node, cursor)),
        totalCount,
      );
    }

    private readonly totalCountFn: CountFn;

    constructor(pageInfo?: PageInfoType, edges?: EdgeType<DTO>[], totalCountFn?: CountFn) {
      this.pageInfo = pageInfo ?? { hasNextPage: false, hasPreviousPage: false };
      this.edges = edges ?? [];
      this.totalCountFn = totalCountFn ?? DEFAULT_COUNT;
    }

    @Field(() => PIT, { description: 'Paging information' })
    pageInfo!: PageInfoType;

    @Field(() => [E], { description: 'Array of edges.' })
    edges!: EdgeType<DTO>[];

    @SkipIf(() => !opts.enableTotalCount, Field(() => Int, { description: 'Fetch total count of records' }))
    get totalCount(): Promise<number> {
      return this.totalCountFn();
    }
  }
  metadataStorage.addConnectionType('cursor', connectionName, AbstractConnection);
  return AbstractConnection;
}
