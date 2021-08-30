import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Class, MapReflector, Query } from '@nestjs-query/core';
import { NotImplementedException } from '@nestjs/common';
import { SkipIf } from '../../../decorators';
import { PagingStrategies } from '../../query';
import { createPager } from './pager';
import {
  Count,
  CountFn,
  CursorConnectionOptions,
  CursorConnectionType,
  EdgeType,
  PageInfoType,
  QueryMany,
  StaticConnectionType,
} from '../interfaces';
import { getOrCreateEdgeType } from './edge.type';
import { getOrCreatePageInfoType } from './page-info.type';
import { getGraphqlObjectName } from '../../../common';

const DEFAULT_COUNT = () => Promise.reject(new NotImplementedException('totalCount not implemented'));

const reflector = new MapReflector('nestjs-query:cursor-connection-type');

function getOrCreateConnectionName<DTO>(DTOClass: Class<DTO>, opts: CursorConnectionOptions): string {
  const { connectionName } = opts;
  if (connectionName) {
    return connectionName;
  }
  const objName = getGraphqlObjectName(DTOClass, 'Unable to make ConnectionType.');
  return `${objName}Connection`;
}

export function getOrCreateCursorConnectionType<DTO>(
  TItemClass: Class<DTO>,
  maybeOpts?: CursorConnectionOptions,
): StaticConnectionType<DTO, PagingStrategies.CURSOR> {
  const opts = maybeOpts ?? { pagingStrategy: PagingStrategies.CURSOR };
  const connectionName = getOrCreateConnectionName(TItemClass, opts);
  return reflector.memoize(TItemClass, connectionName, () => {
    const pager = createPager<DTO>(TItemClass, opts);
    const E = getOrCreateEdgeType(TItemClass);
    const PIT = getOrCreatePageInfoType();
    @ObjectType(connectionName)
    class AbstractConnection implements CursorConnectionType<DTO> {
      static get resolveType() {
        return this;
      }

      static async createFromPromise<Q extends Query<DTO>>(
        queryMany: QueryMany<DTO, Q>,
        query: Q,
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
    return AbstractConnection;
  });
}
