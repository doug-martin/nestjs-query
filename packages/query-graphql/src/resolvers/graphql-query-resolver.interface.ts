import {
  AbstractQueryService,
  CreateMany,
  CreateOne,
  DeepPartial,
  DeleteMany,
  DeleteManyResponse,
  DeleteOne,
  UpdateMany,
  UpdateManyResponse,
  UpdateOne,
} from '@nestjs-query/core';
import { Type } from '@nestjs/common';
import { GraphQLConnectionType, GraphQLQueryType, StaticGraphQLConnectionType, StaticGraphQLQueryType } from '../types';

export interface StaticGraphQLResolver<
  DTO,
  C extends DeepPartial<DTO>,
  U extends DeepPartial<DTO>,
  D extends DeepPartial<DTO>
> {
  QueryType: Type<GraphQLQueryType<DTO>> & StaticGraphQLQueryType<DTO>;
  ConnectionType: Type<GraphQLConnectionType<DTO>> & StaticGraphQLConnectionType<DTO>;
  CreateOneInputType: Type<CreateOne<DTO, C>>;
  CreateManyInputType: Type<CreateMany<DTO, C>>;
  UpdateOneInputType: Type<UpdateOne<DTO, U>>;
  UpdateManyInputType: Type<UpdateMany<DTO, U>>;
  DeleteOneInputType: Type<DeleteOne>;
  DeleteManyInputType: Type<DeleteMany<DTO>>;
  new (service: AbstractQueryService<DTO>): GraphQLResolver<DTO, C, U, D>;
}

export interface GraphQLResolver<
  DTO,
  C extends DeepPartial<DTO>,
  U extends DeepPartial<DTO>,
  D extends DeepPartial<DTO>
> {
  query(query: GraphQLQueryType<DTO>): Promise<GraphQLConnectionType<DTO>>;

  createOne(input: CreateOne<DTO, C>): Promise<DTO>;

  createMany(input: CreateMany<DTO, C>): Promise<DTO[]>;

  updateOne(input: UpdateOne<DTO, U>): Promise<DTO>;

  updateMany(input: UpdateMany<DTO, U>): Promise<UpdateManyResponse>;

  deleteOne(input: DeleteOne): Promise<Partial<DTO>>;

  deleteMany(input: DeleteMany<DTO>): Promise<DeleteManyResponse>;
}
