import { resolve } from 'path';
import { readGraphql } from '../../../__fixtures__';

export { TestRelationDTO } from './test-relation.dto';

export const federationRelationEmptySDL = readGraphql(
  resolve(__dirname, 'federation', 'federation-relation-empty.resolver.graphql'),
);
export const federationRelationSDL = readGraphql(
  resolve(__dirname, 'federation', 'federation-relation.resolver.graphql'),
);
