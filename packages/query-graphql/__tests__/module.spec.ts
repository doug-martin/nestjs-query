import { ObjectType } from '@nestjs/graphql';
import { NestjsQueryGraphQLModule } from '../src';
import { FilterableField } from '../src/decorators/filterable-field.decorator';

describe('NestjsQueryTypeOrmModule', () => {
  @ObjectType()
  class TestDTO {
    @FilterableField()
    name!: string;
  }

  it('should create a module', () => {
    const typeOrmModule = NestjsQueryGraphQLModule.forFeature({
      imports: [],
      resolvers: [
        {
          DTOClass: TestDTO,
          EntityClass: TestDTO,
        },
      ],
    });
    expect(typeOrmModule.imports).toHaveLength(0);
    expect(typeOrmModule.module).toBe(NestjsQueryGraphQLModule);
    expect(typeOrmModule.providers).toHaveLength(1);
    expect(typeOrmModule.exports).toHaveLength(1);
  });
});
