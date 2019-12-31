import { Field, ObjectType } from 'type-graphql';
import { Class } from '@nestjs-query/core';
import { getMetadataStorage } from '../../metadata';
import { ConnectionCursorType, ConnectionCursorScalar } from '../cursor.scalar';

export interface EdgeType<TItem> {
  node: TItem;
  cursor: ConnectionCursorType;
}

export function EdgeType<TItem>(TItemClass: Class<TItem>): Class<EdgeType<TItem>> {
  const objMetadata = getMetadataStorage().getTypeGraphqlObjectMetadata(TItemClass);
  if (!objMetadata) {
    throw new Error(`unable to make edge for class not registered with type-graphql ${TItemClass.name}`);
  }

  @ObjectType(`${objMetadata.name}Edge`)
  class AbstractEdge implements EdgeType<TItem> {
    @Field(() => TItemClass)
    node!: TItem;

    @Field(() => ConnectionCursorScalar, {
      description: 'Used in `before` and `after` args',
    })
    cursor!: ConnectionCursorType;
  }

  return AbstractEdge;
}
