import { Class } from '@nestjs-query/core';
import { resolve } from 'path';
import { instance, mock } from 'ts-mockito';
import { Test } from '@nestjs/testing';
import { PubSub } from 'graphql-subscriptions';
import { Authorizer, pubSubToken } from '../../../src';
import { readGraphql } from '../../__fixtures__';
import { TestService } from './test-resolver.service';
import { TestResolverDTO } from './test-resolver.dto';
import { TestResolverAuthorizer } from './test-resolver.authorizer';
import { getAuthorizerToken } from '../../../src/auth';

export { TestResolverDTO } from './test-resolver.dto';
export { TestResolverInputDTO } from './test-resolver-input.dto';
export { TestService } from './test-resolver.service';

interface ResolverMock<T> {
  resolver: T;
  mockService: TestService;
  mockPubSub: PubSub;
  mockAuthorizer: Authorizer<TestResolverDTO>;
}

export const createResolverFromNest = async <T>(ResolverClass: Class<T>): Promise<ResolverMock<T>> => {
  const mockService = mock(TestService);
  const mockPubSub = mock(PubSub);
  const mockAuthorizer = mock(TestResolverAuthorizer);
  const moduleRef = await Test.createTestingModule({
    providers: [
      ResolverClass,
      TestService,
      { provide: getAuthorizerToken(TestResolverDTO), useClass: TestResolverAuthorizer },
      { provide: pubSubToken(), useValue: instance(mockPubSub) },
    ],
  })
    .overrideProvider(TestService)
    .useValue(instance(mockService))
    .overrideProvider(getAuthorizerToken(TestResolverDTO))
    .useValue(instance(mockAuthorizer))
    .compile();
  return { resolver: moduleRef.get(ResolverClass), mockService, mockPubSub, mockAuthorizer };
};

export const deleteBasicResolverSDL = readGraphql(resolve(__dirname, 'delete', 'delete-basic.resolver.graphql'));
export const deleteDisabledResolverSDL = readGraphql(resolve(__dirname, 'delete', 'delete-disabled.resolver.graphql'));
export const deleteOneDisabledResolverSDL = readGraphql(
  resolve(__dirname, 'delete', 'delete-one-disabled.resolver.graphql'),
);
export const deleteManyDisabledResolverSDL = readGraphql(
  resolve(__dirname, 'delete', 'delete-many-disabled.resolver.graphql'),
);
export const deleteCustomNameResolverSDL = readGraphql(
  resolve(__dirname, 'delete', 'delete-custom-name.resolver.graphql'),
);
export const deleteCustomOneInputResolverSDL = readGraphql(
  resolve(__dirname, 'delete', 'delete-custom-one-input.resolver.graphql'),
);
export const deleteCustomManyInputResolverSDL = readGraphql(
  resolve(__dirname, 'delete', 'delete-custom-many-input.resolver.graphql'),
);
export const deleteSubscriptionResolverSDL = readGraphql(
  resolve(__dirname, 'delete', 'delete-subscription.resolver.graphql'),
);
export const deleteOneSubscriptionResolverSDL = readGraphql(
  resolve(__dirname, 'delete', 'delete-one-subscription.resolver.graphql'),
);
export const deleteManySubscriptionResolverSDL = readGraphql(
  resolve(__dirname, 'delete', 'delete-many-subscription.resolver.graphql'),
);
export const deleteCustomOneMutationResolverSDL = readGraphql(
  resolve(__dirname, 'delete', 'delete-custom-one-mutation.resolver.graphql'),
);
export const deleteCustomManyMutationResolverSDL = readGraphql(
  resolve(__dirname, 'delete', 'delete-custom-many-mutation.resolver.graphql'),
);

export const createBasicResolverSDL = readGraphql(resolve(__dirname, 'create', 'create-basic.resolver.graphql'));
export const createDisabledResolverSDL = readGraphql(resolve(__dirname, 'create', 'create-disabled.resolver.graphql'));
export const createOneDisabledResolverSDL = readGraphql(
  resolve(__dirname, 'create', 'create-one-disabled.resolver.graphql'),
);
export const createManyDisabledResolverSDL = readGraphql(
  resolve(__dirname, 'create', 'create-many-disabled.resolver.graphql'),
);
export const createCustomNameResolverSDL = readGraphql(
  resolve(__dirname, 'create', 'create-custom-name.resolver.graphql'),
);
export const createCustomDTOResolverSDL = readGraphql(
  resolve(__dirname, 'create', 'create-custom-dto.resolver.graphql'),
);
export const createCustomOneInputResolverSDL = readGraphql(
  resolve(__dirname, 'create', 'create-custom-one-input.resolver.graphql'),
);
export const createCustomManyInputResolverSDL = readGraphql(
  resolve(__dirname, 'create', 'create-custom-many-input.resolver.graphql'),
);
export const createSubscriptionResolverSDL = readGraphql(
  resolve(__dirname, 'create', 'create-subscription.resolver.graphql'),
);
export const createCustomOneMutationResolverSDL = readGraphql(
  resolve(__dirname, 'create', 'create-custom-one-mutation.resolver.graphql'),
);
export const createCustomManyMutationResolverSDL = readGraphql(
  resolve(__dirname, 'create', 'create-custom-many-mutation.resolver.graphql'),
);

export const readBasicResolverSDL = readGraphql(resolve(__dirname, 'read', 'read-basic.resolver.graphql'));
export const readDisabledResolverSDL = readGraphql(resolve(__dirname, 'read', 'read-disabled.resolver.graphql'));
export const readOneDisabledResolverSDL = readGraphql(resolve(__dirname, 'read', 'read-one-disabled.resolver.graphql'));
export const readManyDisabledResolverSDL = readGraphql(
  resolve(__dirname, 'read', 'read-many-disabled.resolver.graphql'),
);
export const readCustomNameResolverSDL = readGraphql(resolve(__dirname, 'read', 'read-custom-name.resolver.graphql'));
export const readCustomConnectionResolverSDL = readGraphql(
  resolve(__dirname, 'read', 'read-custom-connection.resolver.graphql'),
);
export const readCustomQueryResolverSDL = readGraphql(resolve(__dirname, 'read', 'read-custom-query.resolver.graphql'));
export const readOffsetQueryResolverSDL = readGraphql(resolve(__dirname, 'read', 'read-offset-query.resolver.graphql'));
export const readCursorConnectionWithTotalCountSDL = readGraphql(
  resolve(__dirname, 'read', 'read-cursor-connection-with-total-count.resolver.graphql'),
);
export const readOffsetConnectionWithTotalCountSDL = readGraphql(
  resolve(__dirname, 'read', 'read-offset-connection-with-total-count.resolver.graphql'),
);
export const readCustomOneQueryResolverSDL = readGraphql(
  resolve(__dirname, 'read', 'read-custom-one-query.resolver.graphql'),
);
export const readCustomManyQueryResolverSDL = readGraphql(
  resolve(__dirname, 'read', 'read-custom-many-query.resolver.graphql'),
);

export const updateBasicResolverSDL = readGraphql(resolve(__dirname, 'update', 'update-basic.resolver.graphql'));
export const updateDisabledResolverSDL = readGraphql(resolve(__dirname, 'update', 'update-disabled.resolver.graphql'));
export const updateOneDisabledResolverSDL = readGraphql(
  resolve(__dirname, 'update', 'update-one-disabled.resolver.graphql'),
);
export const updateManyDisabledResolverSDL = readGraphql(
  resolve(__dirname, 'update', 'update-many-disabled.resolver.graphql'),
);
export const updateCustomNameResolverSDL = readGraphql(
  resolve(__dirname, 'update', 'update-custom-name.resolver.graphql'),
);
export const updateCustomDTOResolverSDL = readGraphql(
  resolve(__dirname, 'update', 'update-custom-dto.resolver.graphql'),
);
export const updateCustomOneInputResolverSDL = readGraphql(
  resolve(__dirname, 'update', 'update-custom-one-input.resolver.graphql'),
);
export const updateCustomManyInputResolverSDL = readGraphql(
  resolve(__dirname, 'update', 'update-custom-many-input.resolver.graphql'),
);
export const updateSubscriptionResolverSDL = readGraphql(
  resolve(__dirname, 'update', 'update-subscription.resolver.graphql'),
);
export const updateOneSubscriptionResolverSDL = readGraphql(
  resolve(__dirname, 'update', 'update-one-subscription.resolver.graphql'),
);
export const updateManySubscriptionResolverSDL = readGraphql(
  resolve(__dirname, 'update', 'update-many-subscription.resolver.graphql'),
);
export const updateCustomOneMutationResolverSDL = readGraphql(
  resolve(__dirname, 'update', 'update-custom-one-mutation.resolver.graphql'),
);
export const updateCustomManyMutationResolverSDL = readGraphql(
  resolve(__dirname, 'update', 'update-custom-many-mutation.resolver.graphql'),
);

export const referenceBasicResolverSDL = readGraphql(
  resolve(__dirname, 'reference', 'reference-basic.resolver.graphql'),
);

export const aggregateResolverSDL = readGraphql(resolve(__dirname, 'aggregate', 'aggregate.resolver.graphql'));
export const aggregateDisabledResolverSDL = readGraphql(
  resolve(__dirname, 'aggregate', 'aggregate-disabled.resolver.graphql'),
);
