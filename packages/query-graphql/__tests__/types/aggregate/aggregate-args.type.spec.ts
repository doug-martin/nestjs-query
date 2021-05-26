// eslint-disable-next-line max-classes-per-file
import { Resolver, Query, ObjectType, GraphQLISODateTime, Args, Int, ArgsType } from '@nestjs/graphql';
import { FilterableField, AggregateArgsType } from '../../../src';
import { generateSchema } from '../../__fixtures__';

describe('AggregateArgsType', (): void => {
  @ObjectType()
  class FakeType {
    @FilterableField()
    stringField!: string;

    @FilterableField()
    numberField!: number;

    @FilterableField()
    boolField!: boolean;

    @FilterableField(() => GraphQLISODateTime)
    dateField!: Date;
  }

  @ArgsType()
  class AggArgs extends AggregateArgsType(FakeType) {}

  it('should create an aggregate type with the correct fields for each type', async () => {
    @Resolver()
    class AggregateArgsTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      aggregate(@Args() args: AggArgs): number {
        return 1;
      }
    }
    const schema = await generateSchema([AggregateArgsTypeSpec]);
    expect(schema).toMatchSnapshot();
  });
});
