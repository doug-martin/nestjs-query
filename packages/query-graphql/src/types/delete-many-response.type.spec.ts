import 'reflect-metadata';
import { buildSchemaSync, Query, Resolver } from 'type-graphql';
import { printSchema } from 'graphql';
import { DeleteManyResponseType } from './delete-many-reponse.type';

describe('DeleteManyResponseType', (): void => {
  it('should create a type-graphql object type', () => {
    @Resolver()
    class TestResolver {
      @Query(() => DeleteManyResponseType)
      deleteTest(): DeleteManyResponseType {
        return { deletedCount: 1 };
      }
    }
    const schema = buildSchemaSync({ resolvers: [TestResolver] });
    expect(printSchema(schema)).toEqual(`type DeleteManyResponseType {
  deletedCount: Int!
}

type Query {
  deleteTest: DeleteManyResponseType!
}
`);
  });
});
