import { resolve } from 'path';
import { readGraphql } from '../../../__fixtures__';

export { TestRelationDTO } from './test-relation.dto';

export const federationRelationEmptySDL = readGraphql(
  resolve(__dirname, 'federation', 'federation-relation-empty.resolver.graphql'),
);
export const federationRelationOneSDL = readGraphql(
  resolve(__dirname, 'federation', 'federation-relation-one.resolver.graphql'),
);
export const federationRelationOneCustomNameSDL = readGraphql(
  resolve(__dirname, 'federation', 'federation-relation-one-custom-name.resolver.graphql'),
);
export const federationRelationOneNullableSDL = readGraphql(
  resolve(__dirname, 'federation', 'federation-relation-one-nullable.resolver.graphql'),
);
export const federationRelationOneDisabledSDL = readGraphql(
  resolve(__dirname, 'federation', 'federation-relation-one-disabled.resolver.graphql'),
);
export const federationRelationManySDL = readGraphql(
  resolve(__dirname, 'federation', 'federation-relation-many.resolver.graphql'),
);
export const federationRelationManyCustomNameSDL = readGraphql(
  resolve(__dirname, 'federation', 'federation-relation-many-custom-name.resolver.graphql'),
);
export const federationRelationManyNullableSDL = readGraphql(
  resolve(__dirname, 'federation', 'federation-relation-many-nullable.resolver.graphql'),
);
export const federationRelationManyDisabledSDL = readGraphql(
  resolve(__dirname, 'federation', 'federation-relation-many-disabled.resolver.graphql'),
);
