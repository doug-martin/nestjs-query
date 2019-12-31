import {
  AbstractQueryService,
  Class,
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
import { ConnectionType, QueryType, StaticConnectionType, StaticQueryType } from '../types';

export interface StaticGraphQLResolver<
  DTO,
  C extends DeepPartial<DTO>,
  U extends DeepPartial<DTO>,
  D extends DeepPartial<DTO>
> {
  QueryType: StaticQueryType<DTO>;
  ConnectionType: StaticConnectionType<DTO>;
  CreateOneInputType: Class<CreateOne<DTO, C>>;
  CreateManyInputType: Class<CreateMany<DTO, C>>;
  UpdateOneInputType: Class<UpdateOne<DTO, U>>;
  UpdateManyInputType: Class<UpdateMany<DTO, U>>;
  DeleteOneInputType: Class<DeleteOne>;
  DeleteManyInputType: Class<DeleteMany<DTO>>;
  new (service: AbstractQueryService<DTO>): GraphQLResolver<DTO, C, U, D>;
}

export interface GraphQLResolver<
  DTO,
  C extends DeepPartial<DTO>,
  U extends DeepPartial<DTO>,
  D extends DeepPartial<DTO>
> {
  query(query: QueryType<DTO>): Promise<ConnectionType<DTO>>;

  createOne(input: CreateOne<DTO, C>): Promise<DTO>;

  createMany(input: CreateMany<DTO, C>): Promise<DTO[]>;

  updateOne(input: UpdateOne<DTO, U>): Promise<DTO>;

  updateMany(input: UpdateMany<DTO, U>): Promise<UpdateManyResponse>;

  deleteOne(input: DeleteOne): Promise<Partial<DTO>>;

  deleteMany(input: DeleteMany<DTO>): Promise<DeleteManyResponse>;
}
