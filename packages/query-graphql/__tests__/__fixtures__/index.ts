import { printSchema } from 'graphql';
import { Test } from '@nestjs/testing';
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql';
import { Class } from '@nestjs-query/core';
import { instance, mock } from 'ts-mockito';
import { PubSub } from 'graphql-subscriptions';
import { Authorizer, pubSubToken } from '../../src';
import { TestService } from './test-resolver.service';
import { TestResolverDTO } from './test-resolver.dto';
import { TestResolverAuthorizer } from './test-resolver.authorizer';
import { getAuthorizerToken } from '../../src/auth';

export { TestResolverInputDTO } from './test-resolver-input.dto';
export { TestResolverDTO } from './test-resolver.dto';
export { TestResolverAuthorizer } from './test-resolver.authorizer';
export { TestService } from './test-resolver.service';
export { TestRelationDTO } from './test-relation.dto';

const getOrCreateSchemaFactory = async (): Promise<GraphQLSchemaFactory> => {
  const moduleRef = await Test.createTestingModule({
    imports: [GraphQLSchemaBuilderModule],
  }).compile();
  return moduleRef.get(GraphQLSchemaFactory);
};

// eslint-disable-next-line @typescript-eslint/ban-types
export const generateSchema = async (resolvers: Function[]): Promise<string> => {
  const sf = await getOrCreateSchemaFactory();
  const schema = await sf.create(resolvers);
  return printSchema(schema);
};

interface ResolverMock<T> {
  resolver: T;
  mockService: TestService;
  mockPubSub: PubSub;
  mockAuthorizer: Authorizer<TestResolverDTO>;
}

export const createResolverFromNest = async <T>(
  ResolverClass: Class<T>,
  DTOClass: Class<unknown> = TestResolverDTO,
): Promise<ResolverMock<T>> => {
  const mockService = mock(TestService);
  const mockPubSub = mock(PubSub);
  const mockAuthorizer = mock(TestResolverAuthorizer);
  const moduleRef = await Test.createTestingModule({
    providers: [
      ResolverClass,
      TestService,
      { provide: getAuthorizerToken(DTOClass), useValue: instance(mockAuthorizer) },
      { provide: pubSubToken(), useValue: instance(mockPubSub) },
    ],
  })
    .overrideProvider(TestService)
    .useValue(instance(mockService))
    .compile();
  return { resolver: moduleRef.get(ResolverClass), mockService, mockPubSub, mockAuthorizer };
};
