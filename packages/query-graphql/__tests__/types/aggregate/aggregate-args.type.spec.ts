// eslint-disable-next-line max-classes-per-file
import { Resolver, Query, ObjectType, GraphQLISODateTime, Args, Int, ArgsType } from '@nestjs/graphql';
import { FilterableField, AggregateArgsType } from '../../../src';
import { expectSDL, aggregateArgsTypeSDL } from '../../__fixtures__';

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
      aggregate(@Args() args: AggArgs): number {
        return 1;
      }
    }
    return expectSDL([AggregateArgsTypeSpec], aggregateArgsTypeSDL);
  });
});
