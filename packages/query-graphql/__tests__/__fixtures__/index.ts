import { readFileSync } from 'fs';
import { printSchema } from 'graphql';
import { resolve } from 'path';
import { Test } from '@nestjs/testing';
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql';

const getOrCreateSchemaFactory = async (): Promise<GraphQLSchemaFactory> => {
  const moduleRef = await Test.createTestingModule({
    imports: [GraphQLSchemaBuilderModule],
  }).compile();
  return moduleRef.get(GraphQLSchemaFactory);
};

export const readGraphql = (filePath: string): string => readFileSync(filePath).toString();

// eslint-disable-next-line @typescript-eslint/ban-types
export const expectSDL = async (resolvers: Function[], sdl: string): Promise<void> => {
  const sf = await getOrCreateSchemaFactory();
  const schema = await sf.create(resolvers);
  return expect(printSchema(schema)).toEqual(sdl);
};

export const aggregateArgsTypeSDL = readGraphql(resolve(__dirname, './aggregate-args-type.graphql'));
export const aggregateResponseTypeSDL = readGraphql(resolve(__dirname, './aggregate-response-type.graphql'));
export const aggregateResponseTypeWithCustomNameSDL = readGraphql(
  resolve(__dirname, './aggregate-response-type-with-custom-name.graphql'),
);
export const deleteManyResponseTypeSDL = readGraphql(resolve(__dirname, './delete-many-response-type.graphql'));
export const updateManyResponseTypeSDL = readGraphql(resolve(__dirname, './update-many-response-type.graphql'));
export const createOneInputTypeSDL = readGraphql(resolve(__dirname, './create-one-input-type.graphql'));
export const createManyInputTypeSDL = readGraphql(resolve(__dirname, './create-many-input-type.graphql'));
export const updateOneInputTypeSDL = readGraphql(resolve(__dirname, './update-one-input-type.graphql'));
export const updateManyInputTypeSDL = readGraphql(resolve(__dirname, './update-many-input-type.graphql'));
export const deleteOneInputTypeSDL = readGraphql(resolve(__dirname, './delete-one-input-type.graphql'));
export const deleteManyInputTypeSDL = readGraphql(resolve(__dirname, './delete-many-input-type.graphql'));
export const mutationArgsTypeSDL = readGraphql(resolve(__dirname, './mutation-args-type.graphql'));
export const relationInputTypeSDL = readGraphql(resolve(__dirname, './relation-input-type.graphql'));
export const relationsInputTypeSDL = readGraphql(resolve(__dirname, './relations-input-type.graphql'));
export const filterInputTypeSDL = readGraphql(resolve(__dirname, './filter-input-type.graphql'));
export const filterAllowedComparisonsInputTypeSDL = readGraphql(
  resolve(__dirname, './filter-allowed-comparisons-input-type.graphql'),
);
export const filterRequiredFieldInputTypeSDL = readGraphql(
  resolve(__dirname, './filter-required-field-input-type.graphql'),
);
export const updateFilterInputTypeSDL = readGraphql(resolve(__dirname, './update-filter-input-type.graphql'));
export const deleteFilterInputTypeSDL = readGraphql(resolve(__dirname, './delete-filter-input-type.graphql'));
export const subscriptionFilterInputTypeSDL = readGraphql(
  resolve(__dirname, './subscription-filter-input-type.graphql'),
);
export const pagingInputTypeSDL = readGraphql(resolve(__dirname, './paging-input-type.graphql'));
export const pageInfoObjectTypeSDL = readGraphql(resolve(__dirname, './page-info-object-type.graphql'));
export const sortingInputTypeSDL = readGraphql(resolve(__dirname, './sorting-input-type.graphql'));
export const cursorQueryArgsTypeSDL = readGraphql(resolve(__dirname, './cursor-query-args-type.graphql'));
export const cursorQueryArgsFilterRequiredTypeSDL = readGraphql(
  resolve(__dirname, './cursor-query-args-required-filter-type.graphql'),
);
export const offsetQueryArgsTypeSDL = readGraphql(resolve(__dirname, './offset-query-args-type.graphql'));
export const offsetQueryArgsFilterRequiredTypeSDL = readGraphql(
  resolve(__dirname, './offset-query-args-required-filter-type.graphql'),
);
export const noPagingQueryArgsTypeSDL = readGraphql(resolve(__dirname, './no-paging-query-args-type.graphql'));
export const noPagingQueryArgsFilterRequiredTypeSDL = readGraphql(
  resolve(__dirname, './no-paging-query-args-required-filter-type.graphql'),
);
export const cursorConnectionObjectTypeSDL = readGraphql(resolve(__dirname, './cursor-connection-object-type.graphql'));
export const cursorConnectionObjectTypeWithTotalCountSDL = readGraphql(
  resolve(__dirname, './cursor-connection-object-type-with-total-count.graphql'),
);
export const edgeObjectTypeSDL = readGraphql(resolve(__dirname, './edge-object-type.graphql'));

export const offsetConnectionObjectTypeSDL = readGraphql(resolve(__dirname, './offset-connection-object-type.graphql'));
export const offsetConnectionObjectTypeWithTotalCountSDL = readGraphql(
  resolve(__dirname, './offset-connection-object-type-with-total-count.graphql'),
);
