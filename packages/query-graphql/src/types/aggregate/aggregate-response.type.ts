import { AggregateResponse, Class, NumberAggregate, TypeAggregate } from '@nestjs-query/core';
import { Field, ObjectType, Float, Int } from '@nestjs/graphql';
import { GraphQLScalarType } from 'graphql';
import { SkipIf } from '../../decorators';
import { FilterableFieldDescriptor, getMetadataStorage } from '../../metadata';
import { UnregisteredObjectType } from '../type.errors';

function NumberAggregatedType<DTO>(
  name: string,
  fields: FilterableFieldDescriptor<unknown>[],
  NumberType: GraphQLScalarType,
): Class<NumberAggregate<DTO>> {
  const fieldNames = fields.map((f) => f.propertyName);
  @ObjectType(name)
  class Aggregated {}
  fieldNames.forEach((propertyName) => {
    Field(() => NumberType, { nullable: true })(Aggregated.prototype, propertyName);
  });

  return Aggregated;
}

function AggregatedType<DTO>(name: string, fields: FilterableFieldDescriptor<unknown>[]): Class<TypeAggregate<DTO>> {
  @ObjectType(name)
  class Aggregated {}
  fields.forEach(({ propertyName, target, returnTypeFunc }) => {
    const rt = returnTypeFunc ? returnTypeFunc() : target;
    Field(() => rt, { nullable: true })(Aggregated.prototype, propertyName);
  });

  return Aggregated;
}

export type AggregateResponseOpts = { prefix: string };

export function AggregateResponseType<DTO>(
  DTOClass: Class<DTO>,
  opts?: AggregateResponseOpts,
): Class<AggregateResponse<DTO>> {
  const metadataStorage = getMetadataStorage();
  const objMetadata = metadataStorage.getGraphqlObjectMetadata(DTOClass);
  if (!objMetadata) {
    throw new UnregisteredObjectType(DTOClass, 'Unable to make AggregationResponseType.');
  }
  const prefix = opts?.prefix ?? objMetadata.name;
  const aggName = `${prefix}AggregateResponse`;
  const existing = metadataStorage.getAggregateResponseType(aggName);
  if (existing) {
    return existing;
  }
  const fields = metadataStorage.getFilterableObjectFields(DTOClass);
  if (!fields) {
    throw new Error(
      `No fields found to create AggregationResponseType for ${DTOClass.name}. Ensure fields are annotated with @FilterableField`,
    );
  }
  const numberFields = fields.filter(({ target }) => target === Number);
  const minMaxFields = fields.filter(({ target }) => target !== Boolean);
  const CountType = NumberAggregatedType(`${prefix}CountAggregate`, fields, Int);
  const SumType = NumberAggregatedType(`${prefix}SumAggregate`, numberFields, Float);
  const AvgType = NumberAggregatedType(`${prefix}AvgAggregate`, numberFields, Float);
  const MinType = AggregatedType(`${prefix}MinAggregate`, minMaxFields);
  const MaxType = AggregatedType(`${prefix}MaxAggregate`, minMaxFields);

  @ObjectType(aggName)
  class AggResponse {
    @Field(() => CountType, { nullable: true })
    count?: NumberAggregate<DTO>;

    @SkipIf(() => numberFields.length === 0, Field(() => SumType, { nullable: true }))
    sum?: NumberAggregate<DTO>;

    @SkipIf(() => numberFields.length === 0, Field(() => AvgType, { nullable: true }))
    avg?: NumberAggregate<DTO>;

    @SkipIf(() => minMaxFields.length === 0, Field(() => MinType, { nullable: true }))
    min?: TypeAggregate<DTO>;

    @SkipIf(() => minMaxFields.length === 0, Field(() => MaxType, { nullable: true }))
    max?: TypeAggregate<DTO>;
  }
  metadataStorage.addAggregateResponseType(aggName, AggResponse);
  return AggResponse;
}
