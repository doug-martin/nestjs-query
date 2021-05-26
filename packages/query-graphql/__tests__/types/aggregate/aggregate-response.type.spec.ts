// eslint-disable-next-line max-classes-per-file
import { AggregateResponse } from '@nestjs-query/core';
import { Resolver, Query, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { AggregateResponseType, FilterableField } from '../../../src';
import { generateSchema } from '../../__fixtures__';

describe('AggregateResponseType', (): void => {
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

  it('should create an aggregate type with the correct fields for each type', async () => {
    const AggResponse = AggregateResponseType(FakeType);
    @Resolver()
    class AggregateResponseTypeSpec {
      @Query(() => AggResponse)
      aggregate(): AggregateResponse<FakeType> {
        return {};
      }
    }
    const schema = await generateSchema([AggregateResponseTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should return the same class if called multiple times', async () => {
    AggregateResponseType(FakeType);
    const AggResponse = AggregateResponseType(FakeType);
    @Resolver()
    class AggregateResponseTypeSpec {
      @Query(() => AggResponse)
      aggregate(): AggregateResponse<FakeType> {
        return {};
      }
    }
    const schema = await generateSchema([AggregateResponseTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should create an aggregate type with a custom name', async () => {
    const AggResponse = AggregateResponseType(FakeType, { prefix: 'CustomPrefix' });
    @Resolver(() => AggResponse)
    class AggregateResponseTypeSpec {
      @Query(() => AggResponse)
      aggregate(): AggregateResponse<FakeType> {
        return {};
      }
    }
    const schema = await generateSchema([AggregateResponseTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('throw an error if the type is not registered', () => {
    class BadType {
      id!: number;
    }
    expect(() => AggregateResponseType(BadType)).toThrow(
      'Unable to make AggregationResponseType. Ensure BadType is annotated with @nestjs/graphql @ObjectType',
    );
  });
  it('throw an error if fields are not found', () => {
    @ObjectType()
    class BadType {
      id!: number;
    }
    expect(() => AggregateResponseType(BadType)).toThrow(
      'No fields found to create AggregationResponseType for BadType. Ensure fields are annotated with @FilterableField',
    );
  });
});
