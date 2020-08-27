import { CRUDAuth, Relation } from '../../src';
import { createDefaultCRUDAuthService } from '../../src/auth';

describe('createDefaultCRUDAuthService', () => {
  type UserContext = { user: { id: number } };
  class TestRelation {
    relationOwnerId!: number;
  }

  @CRUDAuth({ filter: (ctx: UserContext) => ({ decoratorOwnerId: { eq: ctx.user.id } }) })
  class TestDecoratorRelation {
    decoratorOwnerId!: number;
  }

  @CRUDAuth({ filter: (ctx: UserContext) => ({ ownerId: { eq: ctx.user.id } }) })
  @Relation('relations', () => TestRelation, {
    auth: { filter: (ctx: UserContext) => ({ relationOwnerId: { eq: ctx.user.id } }) },
  })
  @Relation('decoratorRelations', () => [TestDecoratorRelation])
  class TestDTO {
    ownerId!: number;
  }

  it('should create an auth filter', async () => {
    const Service = createDefaultCRUDAuthService(TestDTO);
    const filter = await new Service().authFilter({ user: { id: 2 } });
    expect(filter).toEqual({ ownerId: { eq: 2 } });
  });

  it('should return an empty filter if auth not found', async () => {
    class TestNoAuthDTO {
      ownerId!: number;
    }
    const Service = createDefaultCRUDAuthService(TestNoAuthDTO);
    const filter = await new Service().authFilter({ user: { id: 2 } });
    expect(filter).toEqual({});
  });

  it('should create an auth filter for relations using the default auth decorator', async () => {
    const Service = createDefaultCRUDAuthService(TestDTO);
    const filter = await new Service().relationAuthFilter('decoratorRelations', { user: { id: 2 } });
    expect(filter).toEqual({ decoratorOwnerId: { eq: 2 } });
  });

  it('should create an auth filter for relations using the relation options', async () => {
    const Service = createDefaultCRUDAuthService(TestDTO);
    const filter = await new Service().relationAuthFilter('relations', { user: { id: 2 } });
    expect(filter).toEqual({ relationOwnerId: { eq: 2 } });
  });

  it('should return an empty object for an unknown relation', async () => {
    const Service = createDefaultCRUDAuthService(TestDTO);
    const filter = await new Service().relationAuthFilter('unknownRelations', { user: { id: 2 } });
    expect(filter).toEqual({});
  });
});
