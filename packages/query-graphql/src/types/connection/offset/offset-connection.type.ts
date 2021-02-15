import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Class, MapReflector, Query } from '@nestjs-query/core';
import { NotImplementedException } from '@nestjs/common';
import { SkipIf } from '../../../decorators';
import { PagingStrategies } from '../../query';
import { BaseConnectionOptions, Count, CountFn, QueryMany, StaticConnection } from '../interfaces';
import { OffsetPageInfoType } from './offset-page-info.type';
import { getGraphqlObjectName } from '../../../common';
import { createPager } from './pager';

export interface OffsetConnectionOptions extends BaseConnectionOptions {
  pagingStrategy: PagingStrategies.OFFSET;
}

export type StaticOffsetConnectionType<DTO> = StaticConnection<DTO, OffsetConnectionType<DTO>>;

export type OffsetConnectionType<DTO> = {
  pageInfo: OffsetPageInfoType;
  totalCount?: Promise<number>;
  nodes: DTO[];
};

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

// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function OffsetConnectionType<DTO>(
  TItemClass: Class<DTO>,
  opts: OffsetConnectionOptions,
): StaticOffsetConnectionType<DTO> {
  const connectionName = getOrCreateConnectionName(TItemClass, opts);
  return reflector.memoize(TItemClass, connectionName, () => {
    const pager = createPager<DTO>();
    const PIT = OffsetPageInfoType();
    @ObjectType(connectionName)
    class AbstractConnection implements OffsetConnectionType<DTO> {
      static get resolveType() {
        return this;
      }

      static async createFromPromise(
        queryMany: QueryMany<DTO>,
        query: Query<DTO>,
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
