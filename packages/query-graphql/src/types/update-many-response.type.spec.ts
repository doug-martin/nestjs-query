import 'reflect-metadata';
import { buildSchemaSync, Query, Resolver } from 'type-graphql';
import { printSchema } from 'graphql';
import { UpdateManyResponseType } from './update-many-response.type';

describe('UpdateManyResponseType', (): void => {
  it('should create a type-graphql object type', () => {
    @Resolver()
    class TestResolver {
      @Query(() => UpdateManyResponseType)
      updateTest(): UpdateManyResponseType {
        return { updatedCount: 1 };
      }
    }
    const schema = buildSchemaSync({ resolvers: [TestResolver] });
    expect(printSchema(schema)).toEqual(`type Query {
  updateTest: UpdateManyResponseType!
}

type UpdateManyResponseType {
  updatedCount: Int!
}
`);
  });
});
