import { GraphQLSchemaHost, Plugin } from '@nestjs/graphql';
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';
import { GraphQLError } from 'graphql';
import { fieldExtensionsEstimator, getComplexity, simpleEstimator } from 'graphql-query-complexity';
import { Logger, LoggerService } from '@nestjs/common';

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  readonly logger: LoggerService;

  private maxComplexity = 30;

  constructor(private gqlSchemaHost: GraphQLSchemaHost) {
    this.logger = new Logger('complexity-plugin');
  }

  requestDidStart(): GraphQLRequestListener {
    const { schema } = this.gqlSchemaHost;

    return {
      didResolveOperation: ({ request, document }) => {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [fieldExtensionsEstimator(), simpleEstimator({ defaultComplexity: 1 })],
        });
        if (complexity >= this.maxComplexity) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${this.maxComplexity}`,
          );
        }
        this.logger.log(`Query Complexity: ${complexity}`);
      },
    };
  }
}
