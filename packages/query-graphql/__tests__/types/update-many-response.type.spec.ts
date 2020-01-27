import 'reflect-metadata';
import { buildSchemaSync, Query, Resolver } from 'type-graphql';
import { printSchema } from 'graphql';
import { UpdateManyResponse } from '@nestjs-query/core';
import { UpdateManyResponseType } from '../../src';

describe('UpdateManyResponseType', (): void => {
  const URT = UpdateManyResponseType();
  it('should create a type-graphql object type', () => {
    @Resolver()
    class UpdateManyResponseTypeResolver {
      @Query(() => URT)
      updateTest(): UpdateManyResponse {
        return { updatedCount: 1 };
      }
    }
    const schema = buildSchemaSync({ resolvers: [UpdateManyResponseTypeResolver] });
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
