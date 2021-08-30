import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Class, MapReflector, Query } from '@nestjs-query/core';
import { NotImplementedException } from '@nestjs/common';
import { PagingStrategies } from '../../query';
import { SkipIf } from '../../../decorators';
import {
  Count,
  CountFn,
  OffsetConnectionOptions,
  OffsetConnectionType,
  OffsetPageInfoType,
  QueryMany,
  StaticConnectionType,
} from '../interfaces';
import { getGraphqlObjectName } from '../../../common';
import { createPager } from './pager';
import { getOrCreateOffsetPageInfoType } from './offset-page-info.type';

const DEFAULT_COUNT = () => Promise.reject(new NotImplementedException('totalCount not implemented'));

const reflector = new MapReflector('nestjs-query:offset-connection-type');

function getOrCreateConnectionName<DTO>(DTOClass: Class<DTO>, opts: OffsetConnectionOptions): string {
  const { connectionName } = opts;
  if (connectionName) {
    return connectionName;
  }
  const objName = getGraphqlObjectName(DTOClass, 'Unable to make OffsetConnectionType.');
  return `${objName}OffsetConnection`;
}

export function getOrCreateOffsetConnectionType<DTO>(
  TItemClass: Class<DTO>,
  opts: OffsetConnectionOptions,
): StaticConnectionType<DTO, PagingStrategies.OFFSET> {
  const connectionName = getOrCreateConnectionName(TItemClass, opts);
  return reflector.memoize(TItemClass, connectionName, () => {
    const pager = createPager<DTO>();
    const PIT = getOrCreateOffsetPageInfoType();
    @ObjectType(connectionName)
    class AbstractConnection implements OffsetConnectionType<DTO> {
      static get resolveType() {
        return this;
      }

      static async createFromPromise<Q extends Query<DTO>>(
        queryMany: QueryMany<DTO, Q>,
        query: Q,
        count?: Count<DTO>,
      ): Promise<AbstractConnection> {
        const { pageInfo, nodes, totalCount } = await pager.page(queryMany, query, count ?? DEFAULT_COUNT);
        return new AbstractConnection(
          // create the appropriate graphql instance
          new PIT(pageInfo.hasNextPage, pageInfo.hasPreviousPage),
          nodes,
          totalCount,
        );
      }

      private readonly totalCountFn: CountFn;

      constructor(pageInfo?: OffsetPageInfoType, nodes?: DTO[], totalCountFn?: CountFn) {
        this.pageInfo = pageInfo ?? { hasNextPage: false, hasPreviousPage: false };
        this.nodes = nodes ?? [];
        this.totalCountFn = totalCountFn ?? DEFAULT_COUNT;
      }

      @Field(() => PIT, { description: 'Paging information' })
      pageInfo!: OffsetPageInfoType;

      @Field(() => [TItemClass], { description: 'Array of nodes.' })
      nodes!: DTO[];

      @SkipIf(() => !opts.enableTotalCount, Field(() => Int, { description: 'Fetch total count of records' }))
      get totalCount(): Promise<number> {
        return this.totalCountFn();
      }
    }
    return AbstractConnection;
  });
}
