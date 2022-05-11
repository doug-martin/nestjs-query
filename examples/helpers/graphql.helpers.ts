import { GraphQLError } from 'graphql';

export const formatGraphqlError = (error: GraphQLError) => {
  return { message: error.extensions.response.message };
};
