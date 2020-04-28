import { Field, ObjectType } from '@nestjs/graphql';
import { Class } from '@nestjs-query/core';
import { getMetadataStorage } from '../../metadata';
import { ConnectionCursorType, ConnectionCursorScalar } from '../cursor.scalar';
import { UnregisteredObjectType } from '../type.errors';

export interface EdgeTypeConstructor<DTO> {
  new (node: DTO, cursor: ConnectionCursorType): EdgeType<DTO>;
}

export interface EdgeType<DTO> {
  node: DTO;
  cursor: ConnectionCursorType;
}

export function EdgeType<DTO>(DTOClass: Class<DTO>): EdgeTypeConstructor<DTO> {
  const metaDataStorage = getMetadataStorage();
  const existing = metaDataStorage.getEdgeType(DTOClass);
  if (existing) {
    return existing;
  }
  const objMetadata = metaDataStorage.getGraphqlObjectMetadata(DTOClass);
  if (!objMetadata) {
    throw new UnregisteredObjectType(DTOClass, 'Unable to make EdgeType for class.');
  }

  @ObjectType(`${objMetadata.name}Edge`)
  class AbstractEdge implements EdgeType<DTO> {
    constructor(node: DTO, cursor: ConnectionCursorType) {
      this.node = node;
      this.cursor = cursor;
    }

    @Field(() => DTOClass, { description: `The node containing the ${objMetadata.name}` })
    node!: DTO;

    @Field(() => ConnectionCursorScalar, { description: 'Cursor for this node.' })
    cursor!: ConnectionCursorType;
  }
  metaDataStorage.addEdgeType(DTOClass, AbstractEdge);
  return AbstractEdge;
}
