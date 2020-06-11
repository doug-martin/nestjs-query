import { resolve } from 'path';
import { readGraphql } from '../../../__fixtures__';

export { TestRelationDTO } from './test-relation.dto';

export const readRelationEmptySDL = readGraphql(resolve(__dirname, 'read', 'read-relation-empty.resolver.graphql'));
export const readRelationOneSDL = readGraphql(resolve(__dirname, 'read', 'read-relation-one.resolver.graphql'));
export const readRelationOneCustomNameSDL = readGraphql(
  resolve(__dirname, 'read', 'read-relation-one-custom-name.resolver.graphql'),
);
export const readRelationOneNullableSDL = readGraphql(
  resolve(__dirname, 'read', 'read-relation-one-nullable.resolver.graphql'),
);
export const readRelationOneDisabledSDL = readGraphql(
  resolve(__dirname, 'read', 'read-relation-one-disabled.resolver.graphql'),
);
export const readRelationManySDL = readGraphql(resolve(__dirname, 'read', 'read-relation-many.resolver.graphql'));
export const readRelationManyCustomNameSDL = readGraphql(
  resolve(__dirname, 'read', 'read-relation-many-custom-name.resolver.graphql'),
);
export const readRelationManyNullableSDL = readGraphql(
  resolve(__dirname, 'read', 'read-relation-many-nullable.resolver.graphql'),
);
export const readRelationManyDisabledSDL = readGraphql(
  resolve(__dirname, 'read', 'read-relation-many-disabled.resolver.graphql'),
);
export const readRelationManyLimitOffset = readGraphql(
  resolve(__dirname, 'read', 'read-relation-many-limit-offset.resolver.graphql'),
);

export const updateRelationEmptySDL = readGraphql(
  resolve(__dirname, 'update', 'update-relation-empty.resolver.graphql'),
);
export const updateRelationOneSDL = readGraphql(resolve(__dirname, 'update', 'update-relation-one.resolver.graphql'));
export const updateRelationOneCustomNameSDL = readGraphql(
  resolve(__dirname, 'update', 'update-relation-one-custom-name.resolver.graphql'),
);
export const updateRelationOneDisabledSDL = readGraphql(
  resolve(__dirname, 'update', 'update-relation-one-disabled.resolver.graphql'),
);
export const updateRelationManySDL = readGraphql(resolve(__dirname, 'update', 'update-relation-many.resolver.graphql'));
export const updateRelationManyCustomNameSDL = readGraphql(
  resolve(__dirname, 'update', 'update-relation-many-custom-name.resolver.graphql'),
);
export const updateRelationManyDisabledSDL = readGraphql(
  resolve(__dirname, 'update', 'update-relation-many-disabled.resolver.graphql'),
);

export const removeRelationEmptySDL = readGraphql(
  resolve(__dirname, 'remove', 'remove-relation-empty.resolver.graphql'),
);
export const removeRelationOneSDL = readGraphql(resolve(__dirname, 'remove', 'remove-relation-one.resolver.graphql'));
export const removeRelationOneCustomNameSDL = readGraphql(
  resolve(__dirname, 'remove', 'remove-relation-one-custom-name.resolver.graphql'),
);
export const removeRelationOneDisabledSDL = readGraphql(
  resolve(__dirname, 'remove', 'remove-relation-one-disabled.resolver.graphql'),
);
export const removeRelationManySDL = readGraphql(resolve(__dirname, 'remove', 'remove-relation-many.resolver.graphql'));
export const removeRelationManyCustomNameSDL = readGraphql(
  resolve(__dirname, 'remove', 'remove-relation-many-custom-name.resolver.graphql'),
);
export const removeRelationManyDisabledSDL = readGraphql(
  resolve(__dirname, 'remove', 'remove-relation-many-disabled.resolver.graphql'),
);

export const referenceRelationEmptySDL = readGraphql(
  resolve(__dirname, 'reference', 'reference-relation-empty.resolver.graphql'),
);
export const referenceRelationSDL = readGraphql(resolve(__dirname, 'reference', 'reference-relation.resolver.graphql'));
export const referenceRelationNullableSDL = readGraphql(
  resolve(__dirname, 'reference', 'reference-relation-nullable.resolver.graphql'),
);
