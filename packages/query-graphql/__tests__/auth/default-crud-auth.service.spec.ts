// eslint-disable-next-line max-classes-per-file
import { Test, TestingModule } from '@nestjs/testing';
import { Filter } from '@nestjs-query/core';
import { Injectable } from '@nestjs/common';
import { Authorizer, Relation, Authorize, UnPagedRelation } from '../../src';
import {
  AuthorizationContext,
  OperationGroup,
  getAuthorizerToken,
  getCustomAuthorizerToken,
  CustomAuthorizer,
} from '../../src/auth';
import { createAuthorizerProviders } from '../../src/providers';

describe('createDefaultAuthorizer', () => {
  let testingModule: TestingModule;

  type UserContext = { user: { id: number } };
  class TestRelation {
    relationOwnerId!: number;
  }

  @Injectable()
  class RelationAuthorizer implements CustomAuthorizer<RelationWithAuthorizer> {
    authorize(context: UserContext): Promise<Filter<RelationWithAuthorizer>> {
      return Promise.resolve({ authorizerOwnerId: { eq: context.user.id } });
    }

    authorizeRelation(): Promise<Filter<unknown> | undefined> {
      return Promise.reject(new Error('should not have called'));
    }
  }

  @Authorize(RelationAuthorizer)
  class RelationWithAuthorizer {
    authorizerOwnerId!: number;
  }

  @Authorize({
    authorize: (ctx: UserContext) => ({
      decoratorOwnerId: { eq: ctx.user.id },
    }),
  })
  class TestDecoratorRelation {
    decoratorOwnerId!: number;
  }

  @Authorize({
    authorize: (ctx: UserContext, authorizationContext?: AuthorizationContext) =>
      authorizationContext?.operationName === 'other'
        ? { ownerId: { neq: ctx.user.id } }
        : { ownerId: { eq: ctx.user.id } },
  })
  @Relation('relations', () => TestRelation, {
    auth: {
      authorize: (ctx: UserContext, authorizationContext?: AuthorizationContext) =>
        authorizationContext?.operationName === 'other'
          ? { relationOwnerId: { neq: ctx.user.id } }
          : { relationOwnerId: { eq: ctx.user.id } },
    },
  })
  @UnPagedRelation('unPagedDecoratorRelations', () => TestDecoratorRelation)
  @Relation('authorizerRelation', () => RelationWithAuthorizer)
  class TestDTO {
    ownerId!: number;
  }

  class TestNoAuthDTO {
    ownerId!: number;
  }

  @Injectable()
  class TestWithAuthorizerAuthorizer implements CustomAuthorizer<TestWithAuthorizerDTO> {
    authorize(context: UserContext): Promise<Filter<TestWithAuthorizerDTO>> {
      return Promise.resolve({ ownerId: { eq: context.user.id } });
    }

    authorizeRelation(): Promise<Filter<unknown> | undefined> {
      return Promise.resolve(undefined);
    }
  }

  @Authorize(TestWithAuthorizerAuthorizer)
  @Relation('relations', () => TestRelation, {
    auth: {
      authorize: (ctx: UserContext, authorizationContext?: AuthorizationContext) =>
        authorizationContext?.operationName === 'other'
          ? { relationOwnerId: { neq: ctx.user.id } }
          : { relationOwnerId: { eq: ctx.user.id } },
    },
  })
  @UnPagedRelation('unPagedDecoratorRelations', () => TestDecoratorRelation)
  @Relation('authorizerRelation', () => RelationWithAuthorizer)
  class TestWithAuthorizerDTO {
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
          TestWithAuthorizerDTO,
        ]),
      ],
    }).compile();
  });

  afterAll(() => testingModule.close());

  it('should create an auth filter', async () => {
    const authorizer = testingModule.get<Authorizer<TestDTO>>(getAuthorizerToken(TestDTO));
    const filter = await authorizer.authorize(
      { user: { id: 2 } },
      {
        operationName: 'queryMany',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
    expect(filter).toEqual({ ownerId: { eq: 2 } });
  });

  it('should create an auth filter that depends on the passed operation name', async () => {
    const authorizer = testingModule.get<Authorizer<TestDTO>>(getAuthorizerToken(TestDTO));
    const filter = await authorizer.authorize(
      { user: { id: 2 } },
      {
        operationName: 'other',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
    expect(filter).toEqual({ ownerId: { neq: 2 } });
  });

  it('should return an empty filter if auth not found', async () => {
    const authorizer = testingModule.get<Authorizer<TestNoAuthDTO>>(getAuthorizerToken(TestNoAuthDTO));
    const filter = await authorizer.authorize(
      { user: { id: 2 } },
      {
        operationName: 'queryMany',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
    expect(filter).toEqual({});
  });

  it('should create an auth filter for relations using the default auth decorator', async () => {
    const authorizer = testingModule.get<Authorizer<TestDTO>>(getAuthorizerToken(TestDTO));
    const filter = await authorizer.authorizeRelation(
      'unPagedDecoratorRelations',
      { user: { id: 2 } },
      {
        operationName: 'queryRelation',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
    expect(filter).toEqual({ decoratorOwnerId: { eq: 2 } });
  });

  it('should create an auth filter for relations using the relation options', async () => {
    const authorizer = testingModule.get<Authorizer<TestDTO>>(getAuthorizerToken(TestDTO));
    const filter = await authorizer.authorizeRelation(
      'relations',
      { user: { id: 2 } },
      {
        operationName: 'queryRelation',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
    expect(filter).toEqual({ relationOwnerId: { eq: 2 } });
  });

  it('should create an auth filter that depends on the passed operation name for relations using the relation options', async () => {
    const authorizer = testingModule.get<Authorizer<TestDTO>>(getAuthorizerToken(TestDTO));
    const filter = await authorizer.authorizeRelation(
      'relations',
      { user: { id: 2 } },
      {
        operationName: 'other',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
    expect(filter).toEqual({ relationOwnerId: { neq: 2 } });
  });

  it('should create an auth filter for relations using the relation authorizer', async () => {
    const authorizer = testingModule.get<Authorizer<TestDTO>>(getAuthorizerToken(TestDTO));
    const filter = await authorizer.authorizeRelation(
      'authorizerRelation',
      { user: { id: 2 } },
      {
        operationName: 'queryRelation',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
    expect(filter).toEqual({ authorizerOwnerId: { eq: 2 } });
  });

  it('should return an empty object for an unknown relation', async () => {
    const authorizer = testingModule.get<Authorizer<TestDTO>>(getAuthorizerToken(TestDTO));
    const filter = await authorizer.authorizeRelation(
      'unknownRelations',
      { user: { id: 2 } },
      {
        operationName: 'queryRelation',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
    expect(filter).toEqual({});
  });

  it('should call authorizeRelation of authorizer and fallback to authorize decorator', async () => {
    const authorizer = testingModule.get<Authorizer<TestWithAuthorizerDTO>>(getAuthorizerToken(TestWithAuthorizerDTO));
    jest.spyOn(authorizer, 'authorizeRelation');
    const customAuthorizer = testingModule.get<CustomAuthorizer<TestWithAuthorizerDTO>>(
      getCustomAuthorizerToken(TestWithAuthorizerDTO),
    );
    jest.spyOn(customAuthorizer, 'authorizeRelation');
    expect(customAuthorizer).toBeDefined();
    const filter = await authorizer.authorizeRelation(
      'unPagedDecoratorRelations',
      { user: { id: 2 } },
      {
        operationName: 'queryMany',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
    expect(filter).toEqual({
      decoratorOwnerId: { eq: 2 },
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(customAuthorizer.authorizeRelation).toHaveBeenCalledWith(
      'unPagedDecoratorRelations',
      { user: { id: 2 } },
      {
        operationName: 'queryMany',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authorizer.authorizeRelation).toHaveBeenCalledWith(
      'unPagedDecoratorRelations',
      { user: { id: 2 } },
      {
        operationName: 'queryMany',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
  });

  it('should call authorizeRelation of authorizer and fallback to custom authorizer of relation', async () => {
    const authorizer = testingModule.get<Authorizer<TestWithAuthorizerDTO>>(getAuthorizerToken(TestWithAuthorizerDTO));
    jest.spyOn(authorizer, 'authorizeRelation');
    const customAuthorizer = testingModule.get<CustomAuthorizer<TestWithAuthorizerDTO>>(
      getCustomAuthorizerToken(TestWithAuthorizerDTO),
    );
    jest.spyOn(customAuthorizer, 'authorizeRelation');
    expect(customAuthorizer).toBeDefined();
    const relationAuthorizer = testingModule.get<Authorizer<RelationWithAuthorizer>>(
      getAuthorizerToken(RelationWithAuthorizer),
    );
    jest.spyOn(relationAuthorizer, 'authorize');
    const customRelationAuthorizer = testingModule.get<CustomAuthorizer<RelationWithAuthorizer>>(
      getCustomAuthorizerToken(RelationWithAuthorizer),
    );
    jest.spyOn(customRelationAuthorizer, 'authorize');
    const filter = await authorizer.authorizeRelation(
      'authorizerRelation',
      { user: { id: 2 } },
      {
        operationName: 'queryRelation',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
    expect(filter).toEqual({
      authorizerOwnerId: { eq: 2 },
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(customAuthorizer.authorizeRelation).toHaveBeenCalledWith(
      'authorizerRelation',
      { user: { id: 2 } },
      {
        operationName: 'queryRelation',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authorizer.authorizeRelation).toHaveBeenCalledWith(
      'authorizerRelation',
      { user: { id: 2 } },
      {
        operationName: 'queryRelation',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(relationAuthorizer.authorize).toHaveBeenCalledWith(
      { user: { id: 2 } },
      {
        operationName: 'queryRelation',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(customRelationAuthorizer.authorize).toHaveBeenCalledWith(
      { user: { id: 2 } },
      {
        operationName: 'queryRelation',
        operationGroup: OperationGroup.READ,
        readonly: true,
        many: true,
      },
    );
  });
});
