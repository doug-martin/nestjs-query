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
  const objMetadata = getMetadataStorage().getTypeGraphqlObjectMetadata(DTOClass);
  if (!objMetadata) {
    throw new UnregisteredObjectType(DTOClass, 'Unable to make EdgeType for class.');
  }

  @ObjectType(`${objMetadata.name}Edge`)
  class AbstractEdge implements EdgeType<DTO> {
    @Field(() => DTOClass)
    node!: DTO;

    @Field(() => ConnectionCursorScalar)
    cursor!: ConnectionCursorType;
  }

  return AbstractEdge;
}
