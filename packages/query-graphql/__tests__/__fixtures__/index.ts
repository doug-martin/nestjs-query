import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql'
import { Test } from '@nestjs/testing'
import { Class } from '@ptc-org/nestjs-query-core'
import { Authorizer, pubSubToken } from '@ptc-org/nestjs-query-graphql'
import { printSchema } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { instance, mock } from 'ts-mockito'

import { getAuthorizerToken } from '../../src/auth'
import { TestResolverAuthorizer } from './test-resolver.authorizer'
import { TestResolverDTO } from './test-resolver.dto'
import { TestService } from './test-resolver.service'

export { TestRelationDTO } from './test-relation.dto'
export { TestResolverAuthorizer } from './test-resolver.authorizer'
export { TestResolverDTO } from './test-resolver.dto'
export { TestService } from './test-resolver.service'
export { TestResolverInputDTO } from './test-resolver-input.dto'

const getOrCreateSchemaFactory = async (): Promise<GraphQLSchemaFactory> => {
  const moduleRef = await Test.createTestingModule({
    imports: [GraphQLSchemaBuilderModule]
  }).compile()
  return moduleRef.get(GraphQLSchemaFactory)
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const generateSchema = async (resolvers: Function[]): Promise<string> => {
  const sf = await getOrCreateSchemaFactory()
  const schema = await sf.create(resolvers)
  return printSchema(schema)
}

interface ResolverMock<T> {
  resolver: T
  mockService: TestService
  mockPubSub: PubSub
  mockAuthorizer: Authorizer<TestResolverDTO>
}

export const createResolverFromNest = async <T>(
  ResolverClass: Class<T>,
  DTOClass: Class<unknown> = TestResolverDTO
): Promise<ResolverMock<T>> => {
  const mockService = mock(TestService)
  const mockPubSub = mock(PubSub)
  const mockAuthorizer = mock(TestResolverAuthorizer)
  const moduleRef = await Test.createTestingModule({
    providers: [
      ResolverClass,
      TestService,
      { provide: getAuthorizerToken(DTOClass), useValue: instance(mockAuthorizer) },
      { provide: pubSubToken(), useValue: instance(mockPubSub) }
    ]
  })
    .overrideProvider(TestService)
    .useValue(instance(mockService))
    .compile()

  return { resolver: moduleRef.get(ResolverClass), mockService, mockPubSub, mockAuthorizer }
}
