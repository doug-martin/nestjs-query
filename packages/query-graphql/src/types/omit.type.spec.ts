import { printSchema } from 'graphql';
import 'reflect-metadata';
import { buildSchemaSync, ID, Int, ObjectType, Query, Resolver } from 'type-graphql';
import { FilterableField } from '../decorators/filterable-field.decorator';
import { OmitObjectType } from './omit.type';

describe('OmitType', (): void => {
  @ObjectType('TestOmitDto')
  class TestDto {
    @FilterableField(() => ID)
    idField: number;

    @FilterableField(() => Int, { nullable: true })
    field1?: number;

    @FilterableField()
    field2: string;
  }

  // @ts-ignore
  @ObjectType()
  class TestOmitNoFields extends OmitObjectType(TestDto) {}

  @ObjectType()
  class TestOmitFields extends OmitObjectType(TestDto, 'idField', 'field2') {}

  @Resolver(TestDto)
  class TestResolver {
    @Query(() => TestOmitFields)
    query1(): TestOmitNoFields {
      return { idField: 1, field1: 2, field2: '3' };
    }

    query2(): TestOmitFields {
      return { field1: 2 };
    }
  }

  it('create a query for string fields', () => {
    const schema = buildSchemaSync({ resolvers: [TestResolver] });
    expect(printSchema(schema)).toContain(
      `type Query {
  query1: TestOmitFields!
}

type TestOmitDto {
  idField: ID!
  field1: Int
  field2: String!
}

type TestOmitFields {
  field1: Int
}

type TestOmitNoFields {
  idField: ID!
  field1: Int
  field2: String!
}
`,
    );
  });
});
