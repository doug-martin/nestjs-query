import { Class, Filter, MapReflector } from '@codeshine/nestjs-query-core';
import { InputType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { upperCaseFirst } from 'upper-case-first';
import { ResolverRelation } from '../../resolvers/relations';
import { createFilterComparisonType } from './field-comparison';
import { getDTONames, getGraphqlObjectName } from '../../common';
import { getFilterableFields, getQueryOptions, getRelations, SkipIf } from '../../decorators';
import { isInAllowedList } from './helpers';

const reflector = new MapReflector('nestjs-query:filter-type');

export type FilterTypeOptions = {
  allowedBooleanExpressions?: ('and' | 'or')[];
};
export type FilterableRelations = Record<string, Class<unknown>>;
export interface FilterConstructor<T> {
  hasRequiredFilters: boolean;
  new (): Filter<T>;
}

function getObjectTypeName<DTO>(DTOClass: Class<DTO>): string {
  return getGraphqlObjectName(DTOClass, 'No fields found to create FilterType.');
}

function getOrCreateFilterType<T>(
  TClass: Class<T>,
  name: string,
  filterableRelations: FilterableRelations = {},
  isRelation = false,
): FilterConstructor<T> {
  return reflector.memoize(TClass, name, () => {
    const { allowedBooleanExpressions }: FilterTypeOptions = getQueryOptions(TClass) ?? {};
    const fields = getFilterableFields(TClass);
    if (!fields.length) {
      throw new Error(`No fields found to create GraphQLFilter for ${TClass.name}`);
    }
    const hasRequiredFilters = fields.some((f) => f.advancedOptions?.filterRequired === true);
    const isNotAllowedComparison = (val: 'and' | 'or') => !isInAllowedList(allowedBooleanExpressions, val);

    @InputType(name)
    class GraphQLFilter {
      static hasRequiredFilters: boolean = hasRequiredFilters;

      @ValidateNested()
      @SkipIf(() => isNotAllowedComparison('and'), Field(() => [GraphQLFilter], { nullable: true }))
      @Type(() => GraphQLFilter)
      and?: Filter<T>[];

      @ValidateNested()
      @SkipIf(() => isNotAllowedComparison('or'), Field(() => [GraphQLFilter], { nullable: true }))
      @Type(() => GraphQLFilter)
      or?: Filter<T>[];
    }

    const { baseName } = getDTONames(TClass);
    fields.forEach(({ propertyName, target, advancedOptions, returnTypeFunc }) => {
      const FC = createFilterComparisonType({
        FieldType: target,
        fieldName: `${baseName}${upperCaseFirst(propertyName)}`,
        allowedComparisons: advancedOptions?.allowedComparisons,
        returnTypeFunc,
      });
      const nullable = advancedOptions?.filterRequired !== true;
      ValidateNested()(GraphQLFilter.prototype, propertyName);
      Field(() => FC, { nullable })(GraphQLFilter.prototype, propertyName);
      Type(() => FC)(GraphQLFilter.prototype, propertyName);
    });
    Object.keys(filterableRelations).forEach((field) => {
      const FieldType = filterableRelations[field];
      if (FieldType) {
        const FC = getOrCreateFilterType(FieldType, `${name}${getObjectTypeName(FieldType)}Filter`, {}, true);
        ValidateNested()(GraphQLFilter.prototype, field);
        Field(() => FC, { nullable: true })(GraphQLFilter.prototype, field);
        Type(() => FC)(GraphQLFilter.prototype, field);
      }
    });
    if (isRelation) {
      const FC = getOrCreateFilterType(TClass, `${name}ExistsNotExistsFilter`, {});

      ValidateNested()(GraphQLFilter.prototype, 'exists');
      Field(() => FC, { nullable: true })(GraphQLFilter.prototype, 'exists');
      Type(() => FC)(GraphQLFilter.prototype, 'exists');

      ValidateNested()(GraphQLFilter.prototype, 'notExists');
      Field(() => FC, { nullable: true })(GraphQLFilter.prototype, 'notExists');
      Type(() => FC)(GraphQLFilter.prototype, 'notExists');
    }
    return GraphQLFilter as FilterConstructor<T>;
  });
}

function getFilterableRelations(relations: Record<string, ResolverRelation<unknown>>): FilterableRelations {
  const filterableRelations: FilterableRelations = {};
  Object.keys(relations).forEach((r) => {
    const opts = relations[r];
    if (opts && opts.allowFiltering) {
      filterableRelations[r] = opts.DTO;
    }
  });
  return filterableRelations;
}

export function FilterType<T>(TClass: Class<T>): FilterConstructor<T> {
  const { one = {}, many = {} } = getRelations(TClass);
  const filterableRelations: FilterableRelations = { ...getFilterableRelations(one), ...getFilterableRelations(many) };
  return getOrCreateFilterType(TClass, `${getObjectTypeName(TClass)}Filter`, filterableRelations);
}

export function DeleteFilterType<T>(TClass: Class<T>): FilterConstructor<T> {
  return getOrCreateFilterType(TClass, `${getObjectTypeName(TClass)}DeleteFilter`);
}

export function UpdateFilterType<T>(TClass: Class<T>): FilterConstructor<T> {
  return getOrCreateFilterType(TClass, `${getObjectTypeName(TClass)}UpdateFilter`);
}

export function SubscriptionFilterType<T>(TClass: Class<T>): FilterConstructor<T> {
  return getOrCreateFilterType(TClass, `${getObjectTypeName(TClass)}SubscriptionFilter`);
}

export function AggregateFilterType<T>(TClass: Class<T>): FilterConstructor<T> {
  return getOrCreateFilterType(TClass, `${getObjectTypeName(TClass)}AggregateFilter`);
}
