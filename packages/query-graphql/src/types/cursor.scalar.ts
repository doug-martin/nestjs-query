import { GraphQLScalarType, Kind, ValueNode } from 'graphql';

export type ConnectionCursorType = string;

export const ConnectionCursorScalar = new GraphQLScalarType({
  name: 'ConnectionCursor',
  description: 'Cursor for paging through collections',
  parseValue(value: string): string {
    return value;
  },
  serialize(value: string): string {
    return value;
  },
  parseLiteral(ast: ValueNode): string | null {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});
