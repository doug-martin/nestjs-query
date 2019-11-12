import { printSchema } from 'graphql';
import 'reflect-metadata';
import { buildSchemaSync, ID, Int, ObjectType, Query, Resolver } from 'type-graphql';
import { FilterableField } from '../decorators/filterable-field.decorator';
import { PartialType } from './partial.type';

describe('PartialType', (): void => {
  @ObjectType('TestPartialDto')
  class TestDto {
    @FilterableField(() => ID)
    idField: number;

    @FilterableField(() => Int, { nullable: true })
    field1?: number;

    @FilterableField()
    field2: string;
  }

  @ObjectType()
  class TestPartialFields extends PartialType(TestDto) {}

  @Resolver(TestDto)
  class TestResolver {
    @Query(() => TestPartialFields)
    query1(): TestPartialFields {
      return { idField: 1, field1: 2, field2: '3' };
    }
  }

  it('should create an object with all partial fields', () => {
    const schema = buildSchemaSync({ resolvers: [TestResolver] });
    expect(printSchema(schema)).toContain(
      `type Query {
  query1: TestPartialFields!
}

type TestPartialDto {
  idField: ID!
  field1: Int
  field2: String!
}

type TestPartialFields {
  idField: ID
  field1: Int
  field2: String
}
`,
    );
  });
});
