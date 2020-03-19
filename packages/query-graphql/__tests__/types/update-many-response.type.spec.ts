import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { Query, Resolver, GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql';
import { printSchema } from 'graphql';
import { UpdateManyResponse } from '@nestjs-query/core';
import { UpdateManyResponseType } from '../../src';

describe('UpdateManyResponseType', () => {
  let schemaFactory: GraphQLSchemaFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
    }).compile();
    schemaFactory = moduleRef.get(GraphQLSchemaFactory);
  });

  const URT = UpdateManyResponseType();
  it('should create a @nestjs/graphql object type', async () => {
    @Resolver()
    class UpdateManyResponseTypeResolver {
      @Query(() => URT)
      updateTest(): UpdateManyResponse {
        return { updatedCount: 1 };
      }
    }
    const schema = await schemaFactory.create([UpdateManyResponseTypeResolver]);
    expect(printSchema(schema)).toEqual(`type Query {
  updateTest: UpdateManyResponse!
}

type UpdateManyResponse {
  """The number of records updated."""
  updatedCount: Int!
}
`);
  });
});
