import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { Resolver, Query, GraphQLSchemaFactory, GraphQLSchemaBuilderModule } from '@nestjs/graphql';
import { DeleteManyResponse } from '@nestjs-query/core';
import { printSchema } from 'graphql';
import { DeleteManyResponseType } from '../../src/types';

describe('DeleteManyResponseType', (): void => {
  let schemaFactory: GraphQLSchemaFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
    }).compile();
    schemaFactory = moduleRef.get(GraphQLSchemaFactory);
  });

  it('should create a @nestjs/graphql object type', async () => {
    const D = DeleteManyResponseType();
    @Resolver()
    class TestDeleteManyResponseResolver {
      @Query(() => D)
      deleteTest(): DeleteManyResponse {
        return { deletedCount: 1 };
      }
    }
    const schema = await schemaFactory.create([TestDeleteManyResponseResolver]);
    expect(printSchema(schema)).toEqual(`type DeleteManyResponse {
  """The number of records deleted."""
  deletedCount: Int!
}

type Query {
  deleteTest: DeleteManyResponse!
}
`);
  });
});
