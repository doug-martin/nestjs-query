import { ObjectType } from '@nestjs/graphql';
import { NestjsQueryGraphQLModule } from '../src';
import { FilterableField } from '../src/decorators/filterable-field.decorator';

describe('NestjsQueryGraphQLModule', () => {
  @ObjectType()
  class TestDTO {
    @FilterableField()
    name!: string;
  }

  it('should create a module', () => {
    const graphqlModule = NestjsQueryGraphQLModule.forFeature({
      imports: [],
      resolvers: [
        {
          DTOClass: TestDTO,
          EntityClass: TestDTO,
        },
      ],
    });
    expect(graphqlModule.imports).toHaveLength(1);
    expect(graphqlModule.module).toBe(NestjsQueryGraphQLModule);
    expect(graphqlModule.providers).toHaveLength(3);
    expect(graphqlModule.exports).toHaveLength(4);
  });
});
