import { DeepPartial } from '../common';
import {
  DeleteManyResponse,
  Query,
  UpdateManyResponse,
  UpdateOne,
  UpdateMany,
  DeleteOne,
  DeleteMany,
  CreateOne,
  CreateMany,
} from '../interfaces';

export interface QueryService<T> {
  query(query: Query<T>): Promise<T[]>;

  queryOne(query: Query<T>): Promise<T | undefined>;

  getOne(query: Query<T>): Promise<T>;

  findById(id: string | number): Promise<T | undefined>;

  getById(id: string | number): Promise<T>;

  createOne<C extends DeepPartial<T>>(create: CreateOne<T, C>): Promise<T>;

  createMany<C extends DeepPartial<T>>(create: CreateMany<T, C>): Promise<T[]>;

  updateOne<U extends DeepPartial<T>>(update: UpdateOne<T, U>): Promise<T>;

  updateMany<U extends DeepPartial<T>>(update: UpdateMany<T, U>): Promise<UpdateManyResponse>;

  deleteOne(deleteOne: DeleteOne): Promise<T>;

  deleteMany(deleteMany: DeleteMany<T>): Promise<DeleteManyResponse>;
}
