import { Type } from '@nestjs/common';
import { Field, ObjectType } from 'type-graphql';
import { getMetadataStorage } from '../../metadata';
import { ConnectionCursor, ConnectionCursorScalar } from '../cursor.scalar';

export interface EdgeType<TItem> {
  node: TItem;
  cursor: ConnectionCursor;
}

export const EdgeType = <TItem>(TItemClass: Type<TItem>): Type<EdgeType<TItem>> => {
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
    cursor!: ConnectionCursor;
  }
  return AbstractEdge;
};
