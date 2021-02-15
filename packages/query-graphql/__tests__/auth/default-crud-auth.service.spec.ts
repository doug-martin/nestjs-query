// eslint-disable-next-line max-classes-per-file
import { Test, TestingModule } from '@nestjs/testing';
import { Filter } from '@nestjs-query/core';
import { Injectable } from '@nestjs/common';
import { Authorizer, Relation, Authorize, UnPagedRelation } from '../../src';
import { getAuthorizerToken } from '../../src/auth';
import { createAuthorizerProviders } from '../../src/providers';

describe('createDefaultAuthorizer', () => {
  let testingModule: TestingModule;

  type UserContext = { user: { id: number } };
  class TestRelation {
    relationOwnerId!: number;
  }

  @Injectable()
  class RelationAuthorizer implements Authorizer<RelationWithAuthorizer> {
    authorize(context: UserContext): Promise<Filter<RelationWithAuthorizer>> {
      return Promise.resolve({ authorizerOwnerId: { eq: context.user.id } });
    }

    authorizeRelation(): Promise<Filter<unknown>> {
      return Promise.reject(new Error('should not have called'));
    }
  }

  @Authorize(RelationAuthorizer)
  class RelationWithAuthorizer {
    authorizerOwnerId!: number;
  }

  @Authorize({ authorize: (ctx: UserContext) => ({ decoratorOwnerId: { eq: ctx.user.id } }) })
  class TestDecoratorRelation {
    decoratorOwnerId!: number;
  }

  @Authorize({ authorize: (ctx: UserContext) => ({ ownerId: { eq: ctx.user.id } }) })
  @Relation('relations', () => TestRelation, {
    auth: { authorize: (ctx: UserContext) => ({ relationOwnerId: { eq: ctx.user.id } }) },
  })
  @UnPagedRelation('decoratorRelations', () => TestDecoratorRelation)
  @Relation('authorizerRelation', () => RelationWithAuthorizer)
  class TestDTO {
    ownerId!: number;
  }

  class TestNoAuthDTO {
    ownerId!: number;
  }

  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        ...createAuthorizerProviders([
          TestDecoratorRelation,
          TestRelation,
          RelationWithAuthorizer,
          TestDTO,
          TestNoAuthDTO,
        ]),
      ],
    }).compile();
  });

  afterAll(() => testingModule.close());

  it('should create an auth filter', async () => {
    const authorizer = testingModule.get<Authorizer<TestDTO>>(getAuthorizerToken(TestDTO));
    const filter = await authorizer.authorize({ user: { id: 2 } });
    expect(filter).toEqual({ ownerId: { eq: 2 } });
  });

  it('should return an empty filter if auth not found', async () => {
    const authorizer = testingModule.get<Authorizer<TestNoAuthDTO>>(getAuthorizerToken(TestNoAuthDTO));
    const filter = await authorizer.authorize({ user: { id: 2 } });
    expect(filter).toEqual({});
  });

  it('should create an auth filter for relations using the default auth decorator', async () => {
    const authorizer = testingModule.get<Authorizer<TestDTO>>(getAuthorizerToken(TestDTO));
    const filter = await authorizer.authorizeRelation('decoratorRelations', { user: { id: 2 } });
    expect(filter).toEqual({ decoratorOwnerId: { eq: 2 } });
  });

  it('should create an auth filter for relations using the relation options', async () => {
    const authorizer = testingModule.get<Authorizer<TestDTO>>(getAuthorizerToken(TestDTO));
    const filter = await authorizer.authorizeRelation('relations', { user: { id: 2 } });
    expect(filter).toEqual({ relationOwnerId: { eq: 2 } });
  });

  it('should create an auth filter for relations using the relation authorizer', async () => {
    const authorizer = testingModule.get<Authorizer<TestDTO>>(getAuthorizerToken(TestDTO));
    const filter = await authorizer.authorizeRelation('authorizerRelation', { user: { id: 2 } });
    expect(filter).toEqual({ authorizerOwnerId: { eq: 2 } });
  });

  it('should return an empty object for an unknown relation', async () => {
    const authorizer = testingModule.get<Authorizer<TestDTO>>(getAuthorizerToken(TestDTO));
    const filter = await authorizer.authorizeRelation('unknownRelations', { user: { id: 2 } });
    expect(filter).toEqual({});
  });
});
