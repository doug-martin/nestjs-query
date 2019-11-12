import { DeepPartial } from '../common';
import {
  DeleteManyResponse,
  FindManyResponse,
  Query,
  UpdateManyResponse,
  UpdateOne,
  UpdateMany,
  DeleteOne,
  DeleteMany,
  CreateOne,
  CreateMany,
} from '../interfaces';

export abstract class AbstractQueryService<T> {
  abstract query(query: Query<T>): Promise<FindManyResponse<T>>;

  abstract queryOne(query: Query<T>): Promise<T | undefined>;

  abstract getOne(query: Query<T>): Promise<T>;

  abstract findById(id: string | number): Promise<T | undefined>;

  abstract getById(id: string | number): Promise<T>;

  abstract createOne<C extends DeepPartial<T>>(create: CreateOne<T, C>): Promise<T>;

  abstract createMany<C extends DeepPartial<T>>(create: CreateMany<T, C>): Promise<T[]>;

  abstract updateOne<U extends DeepPartial<T>>(update: UpdateOne<T, U>): Promise<T>;

  abstract updateMany<U extends DeepPartial<T>>(update: UpdateMany<T, U>): Promise<UpdateManyResponse>;

  abstract deleteOne(deleteOne: DeleteOne): Promise<T>;

  abstract deleteMany(deleteMany: DeleteMany<T>): Promise<DeleteManyResponse>;

  /**
   * @param entities
   * @param totalCount
   */
  protected createFindManyResponse(entities: T[], totalCount: number): FindManyResponse<T> {
    return { entities, totalCount };
  }

  /**
   * @param updatedCount
   */
  protected createUpdateManyResponse(updatedCount: number): UpdateManyResponse {
    return { updatedCount };
  }

  /**
   * @param deletedCount
   */
  protected createDeleteManyResponse(deletedCount: number): DeleteManyResponse {
    return { deletedCount };
  }
}
