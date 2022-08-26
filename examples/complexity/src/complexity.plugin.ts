import { Plugin } from '@nestjs/apollo'
import { Logger, LoggerService } from '@nestjs/common'
import { GraphQLSchemaHost } from '@nestjs/graphql'
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base'
import { GraphQLError } from 'graphql'
import { fieldExtensionsEstimator, getComplexity, simpleEstimator } from 'graphql-query-complexity'

@Plugin()
export class ComplexityPlugin implements ApolloServerPlugin {
  readonly logger: LoggerService

  private maxComplexity = 30

  constructor(private gqlSchemaHost: GraphQLSchemaHost) {
    this.logger = new Logger('complexity-plugin')
  }

  requestDidStart(): Promise<GraphQLRequestListener> {
    const { schema } = this.gqlSchemaHost

    return Promise.resolve({
      didResolveOperation: ({ request, document }): Promise<void> => {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [fieldExtensionsEstimator(), simpleEstimator({ defaultComplexity: 1 })]
        })
        if (complexity >= this.maxComplexity) {
          return Promise.reject(
            new GraphQLError(`Query is too complex: ${complexity}. Maximum allowed complexity: ${this.maxComplexity}`)
          )
        }
        this.logger.log(`Query Complexity: ${complexity}`)
        return Promise.resolve()
      }
    })
  }
}
