import { offsetToCursor } from 'graphql-relay';
import { Field, ObjectType } from '@nestjs/graphql';
import { Class } from '@nestjs-query/core';
import { CursorPagingType } from '../query';
import { PageInfoType } from './page-info.type';
import { EdgeType } from './edge.type';
import { getMetadataStorage } from '../../metadata';
import { UnregisteredObjectType } from '../type.errors';

export interface StaticConnectionType<TItem> {
  createFromPromise(findMany: Promise<TItem[]>, pagingInfo: CursorPagingType): Promise<ConnectionType<TItem>>;
  createFromArray(findMany: TItem[], pagingInfo: CursorPagingType): ConnectionType<TItem>;
  empty(): ConnectionType<TItem>;
  new (): ConnectionType<TItem>;
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
  const E = EdgeType(TItemClass);
  const PIT = PageInfoType();
  @ObjectType(`${objMetadata.name}Connection`)
  class AbstractConnection implements ConnectionType<DTO> {
    static async createFromPromise(items: Promise<DTO[]>, pagingInfo: CursorPagingType): Promise<AbstractConnection> {
      return this.createFromArray(await items, pagingInfo);
    }

    static createFromArray(dtos: DTO[], pagingInfo: CursorPagingType): AbstractConnection {
      if (!dtos.length) {
        return this.empty();
      }
      const baseOffset = pagingInfo.offset || 0;
      const pageInfo: PageInfoType = this.createPageInfo(dtos, pagingInfo);
      const edges: EdgeType<DTO>[] = dtos.map((dto, i) => this.createEdge(dto, i, baseOffset));
      return new AbstractConnection(pageInfo, edges);
    }

    static empty(): AbstractConnection {
      return new AbstractConnection();
    }

    private static createPageInfo(dtos: DTO[], pagingInfo: CursorPagingType): PageInfoType {
      const { length } = dtos;
      const { first, last, after, before } = pagingInfo;
      const isForwardPaging = !!first || !!after || !!last || !!before;
      const baseOffset = pagingInfo.offset || 0;
      const startCursor = offsetToCursor(baseOffset);
      const endCursor = offsetToCursor(baseOffset + length - 1);
      const hasNextPage = isForwardPaging ? length >= (pagingInfo.limit || 0) : false;
      const hasPreviousPage = isForwardPaging ? baseOffset > 0 : false;
      return new PIT(hasNextPage, hasPreviousPage, startCursor, endCursor);
    }

    private static createEdge(dto: DTO, index: number, initialOffset: number): EdgeType<DTO> {
      return new E(dto, offsetToCursor(initialOffset + index));
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
