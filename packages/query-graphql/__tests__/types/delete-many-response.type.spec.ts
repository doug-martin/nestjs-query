import 'reflect-metadata';
import { buildSchemaSync, Query, Resolver } from 'type-graphql';
import { printSchema } from 'graphql';
import { DeleteManyResponse } from '@nestjs-query/core';
import { DeleteManyResponseType } from '../../src';

describe('DeleteManyResponseType', (): void => {
  it('should create a type-graphql object type', () => {
    const D = DeleteManyResponseType();
    @Resolver()
    class TestDeleteManyResponseResolver {
      @Query(() => D)
      deleteTest(): DeleteManyResponse {
        return { deletedCount: 1 };
      }
    }
    const schema = buildSchemaSync({ resolvers: [TestDeleteManyResponseResolver] });
    expect(printSchema(schema)).toEqual(`type DeleteManyResponseType {
  deletedCount: Int!
}

type Query {
  deleteTest: DeleteManyResponseType!
}
`);
  });
});
