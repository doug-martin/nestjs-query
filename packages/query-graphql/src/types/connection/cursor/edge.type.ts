import { Field, ObjectType } from '@nestjs/graphql';
import { Class, ValueReflector } from '@nestjs-query/core';
import { ConnectionCursorType, ConnectionCursorScalar } from '../../cursor.scalar';
import { getGraphqlObjectName } from '../../../common';

export interface EdgeTypeConstructor<DTO> {
  new (node: DTO, cursor: ConnectionCursorType): EdgeType<DTO>;
}

export interface EdgeType<DTO> {
  node: DTO;
  cursor: ConnectionCursorType;
}

const reflector = new ValueReflector('nestjs-query:edge-type');
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function EdgeType<DTO>(DTOClass: Class<DTO>): EdgeTypeConstructor<DTO> {
  return reflector.memoize(DTOClass, () => {
    const objName = getGraphqlObjectName(DTOClass, 'Unable to make EdgeType for class.');
    @ObjectType(`${objName}Edge`)
    class AbstractEdge implements EdgeType<DTO> {
      constructor(node: DTO, cursor: ConnectionCursorType) {
        this.node = node;
        this.cursor = cursor;
      }

      @Field(() => DTOClass, { description: `The node containing the ${objName}` })
      node!: DTO;

      @Field(() => ConnectionCursorScalar, { description: 'Cursor for this node.' })
      cursor!: ConnectionCursorType;
    }
    return AbstractEdge;
  });
}
