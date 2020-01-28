import { offsetToCursor } from 'graphql-relay';
import { Field, ObjectType } from 'type-graphql';
import { Class } from '@nestjs-query/core';
import { plainToClass } from 'class-transformer';
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
  const objMetadata = metadataStorage.getTypeGraphqlObjectMetadata(TItemClass);
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
      return plainToClass(AbstractConnection, { pageInfo, edges });
    }

    static empty(): AbstractConnection {
      return plainToClass(AbstractConnection, {
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
        edges: [],
      });
    }

    private static createPageInfo(dtos: DTO[], pagingInfo: CursorPagingType): PageInfoType {
      const { length } = dtos;
      const { first, after } = pagingInfo;
      const isForwardPaging = !!first || !!after;
      const baseOffset = pagingInfo.offset || 0;
      const startCursor = offsetToCursor(baseOffset);
      const endCursor = offsetToCursor(baseOffset + length - 1);
      const hasNextPage = isForwardPaging ? length >= (pagingInfo.limit || 0) : false;
      const hasPreviousPage = isForwardPaging ? false : baseOffset > 0;
      return plainToClass(PIT, { hasNextPage, hasPreviousPage, startCursor, endCursor });
    }

    private static createEdge(dto: DTO, index: number, initialOffset: number): EdgeType<DTO> {
      return plainToClass(E, { node: dto, cursor: offsetToCursor(initialOffset + index) });
    }

    @Field(() => PIT, { description: 'Paging information' })
    pageInfo!: PageInfoType;

    @Field(() => [E], { description: 'Array of edges.' })
    edges!: EdgeType<DTO>[];
  }
  metadataStorage.addConnectionType(TItemClass, AbstractConnection);
  return AbstractConnection;
}
