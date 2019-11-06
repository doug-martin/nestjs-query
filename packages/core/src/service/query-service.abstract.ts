import { FindManyResponse, Query } from '../interfaces';

export abstract class AbstractQueryService<T> {
  abstract query(query: Query<T>): Promise<FindManyResponse<T>>;

  abstract queryOne(query: Query<T>): Promise<T | undefined>;

  abstract getOne(query: Query<T>): Promise<T>;

  abstract findById(id: string | number): Promise<T | undefined>;

  abstract getById(id: string | number): Promise<T>;

  abstract createOne(dto: T): Promise<T>;

  abstract createMany(dto: T[]): Promise<T[]>;

  abstract updateOne(query: Query<T>, dto: T): Promise<T>;

  abstract updateMany(query: Query<T>, dto: T): Promise<number>;

  abstract deleteOne(query: Query<T>): Promise<void | T>;

  abstract deleteMany(query: Query<T>): Promise<number>;

  /**
   * @param entities
   * @param totalCount
   */
  protected createFindManyResponse(entities: T[], totalCount: number): FindManyResponse<T> {
    return { entities, totalCount };
  }
}
