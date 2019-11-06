import { GraphQLScalarType, Kind } from 'graphql';

export type ConnectionCursor = string;

export const ConnectionCursorScalar = new GraphQLScalarType({
  name: 'ConnectionCursor',
  description: 'Cursor for paging through collections',
  parseValue(value: string) {
    return value;
  },
  serialize(value: string) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }
    return null;
  },
});
