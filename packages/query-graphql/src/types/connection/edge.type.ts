import { Field, ObjectType } from 'type-graphql';
import { Class } from '@nestjs-query/core';
import { getMetadataStorage } from '../../metadata';
import { ConnectionCursorType, ConnectionCursorScalar } from '../cursor.scalar';
import { UnregisteredObjectType } from '../type.errors';

export interface EdgeType<TItem> {
  node: TItem;
  cursor: ConnectionCursorType;
}

export function EdgeType<DTO>(DTOClass: Class<DTO>): Class<EdgeType<DTO>> {
  const metaDataStorage = getMetadataStorage();
  const existing = metaDataStorage.getEdgeType(DTOClass);
  if (existing) {
    return existing;
  }
  const objMetadata = metaDataStorage.getTypeGraphqlObjectMetadata(DTOClass);
  if (!objMetadata) {
    throw new UnregisteredObjectType(DTOClass, 'Unable to make EdgeType for class.');
  }

  @ObjectType(`${objMetadata.name}Edge`)
  class AbstractEdge implements EdgeType<DTO> {
    @Field(() => DTOClass, { description: `The node containing the ${objMetadata.name}` })
    node!: DTO;

    @Field(() => ConnectionCursorScalar, { description: 'Cursor for this node.' })
    cursor!: ConnectionCursorType;
  }
  metaDataStorage.addEdgeType(DTOClass, AbstractEdge);
  return AbstractEdge;
}
