// eslint-disable-next-line max-classes-per-file
import {
  AuthorizationContext,
  Authorize,
  Authorizer,
  Relation,
  UnPagedRelation,
  GlobalAuthorizer,
  OperationGroup,
} from '../../src';
import { Filter } from '@nestjs-query/core';
import { createAuthorizerProviders } from '../../src/providers';
import { Test, TestingModule } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';

describe('GlobalAuthorizer', () => {
  let testingModule: TestingModule;
  let globalAuthorizer: GlobalAuthorizer;

  type UserContext = { user: { id: number } };

  class TestRelation {
    relationOwnerId!: number;
  }

  @Injectable()
  class RelationAuthorizer implements Authorizer<RelationWithAuthorizer> {
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

  class TestNoAuthDTO {
    ownerId!: number;
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
  @Relation('noAuthRelation', () => TestNoAuthDTO)
  class TestDTO {
    ownerId!: number;
  }

  @Injectable()
  class TestWithAuthorizerAuthorizer implements Authorizer<TestWithAuthorizerDTO> {
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
        GlobalAuthorizer,
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
    globalAuthorizer = testingModule.get<GlobalAuthorizer>(GlobalAuthorizer);
  });

  afterAll(() => testingModule.close());

  it('should create an auth filter', async () => {
    const filter = await globalAuthorizer.authorize(
      TestDTO,
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

  it('should throw if no authorization filter is defined for a DTO', async () => {
    await expect(
      globalAuthorizer.authorize(
        TestRelation,
        { user: { id: 2 } },
        {
          operationName: 'queryMany',
          operationGroup: OperationGroup.READ,
          readonly: true,
          many: true,
        },
      ),
    ).rejects.toThrow('No auth filter defined for TestRelation');
  });

  it('should build filter with parent dtos authorize relation if defined', async () => {
    await expect(
      globalAuthorizer.authorizeRelation(
        TestDTO,
        'relations',
        { user: { id: 2 } },
        {
          operationName: 'queryMany',
          operationGroup: OperationGroup.READ,
          readonly: true,
          many: true,
        },
      ),
    ).resolves.toEqual({
      relationOwnerId: {
        eq: 2,
      },
    });
  });

  it('should build filter with relations authorize if parent dto does not define filter', async () => {
    await expect(
      globalAuthorizer.authorizeRelation(
        TestDTO,
        'authorizerRelation',
        { user: { id: 2 } },
        {
          operationName: 'queryMany',
          operationGroup: OperationGroup.READ,
          readonly: true,
          many: true,
        },
      ),
    ).resolves.toEqual({ authorizerOwnerId: { eq: 2 } });
  });

  it('should throw if neither parent nor relation dto defines filter', async () => {
    await expect(
      globalAuthorizer.authorizeRelation(
        TestDTO,
        'noAuthRelation',
        { user: { id: 2 } },
        {
          operationName: 'queryMany',
          operationGroup: OperationGroup.READ,
          readonly: true,
          many: true,
        },
      ),
    ).rejects.toThrow('No auth filter defined for TestNoAuthDTO');
  });
});
