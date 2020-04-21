/* eslint-disable @typescript-eslint/no-unused-vars */
import { NotImplementedException } from '@nestjs/common';
import { Filter, UpdateManyResponse, Query, DeleteManyResponse } from '../interfaces';
import { QueryService } from './query.service';
import { DeepPartial, Class } from '../common';

export class NoOpQueryService<DTO> implements QueryService<DTO> {
  private static instance: QueryService<unknown> = new NoOpQueryService();

  static getInstance<DTO>(): QueryService<DTO> {
    return this.instance as QueryService<DTO>;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  addRelations<Relation>(relationName: string, id: string | number, relationIds: (string | number)[]): Promise<DTO> {
    return Promise.reject(new NotImplementedException('addRelations is not implemented'));
  }

  createMany<C extends DeepPartial<DTO>>(items: C[]): Promise<DTO[]> {
    return Promise.reject(new NotImplementedException('createMany is not implemented'));
  }

  createOne<C extends DeepPartial<DTO>>(item: C): Promise<DTO> {
    return Promise.reject(new NotImplementedException('createOne is not implemented'));
  }

  deleteMany(filter: Filter<DTO>): Promise<DeleteManyResponse> {
    return Promise.reject(new NotImplementedException('deleteMany is not implemented'));
  }

  deleteOne(id: number | string): Promise<DTO> {
    return Promise.reject(new NotImplementedException('deleteOne is not implemented'));
  }

  findById(id: string | number): Promise<DTO | undefined> {
    return Promise.reject(new NotImplementedException('findById is not implemented'));
  }

  findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entity: DTO,
  ): Promise<Relation | undefined>;

  findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: DTO[],
  ): Promise<Map<DTO, Relation | undefined>>;

  findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entity: DTO | DTO[],
  ): Promise<(Relation | undefined) | Map<DTO, Relation | undefined>> {
    return Promise.reject(new NotImplementedException('findRelation is not implemented'));
  }

  getById(id: string | number): Promise<DTO> {
    return Promise.reject(new NotImplementedException('getById is not implemented'));
  }

  query(query: Query<DTO>): Promise<DTO[]> {
    return Promise.reject(new NotImplementedException('query is not implemented'));
  }

  queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entity: DTO,
    query: Query<Relation>,
  ): Promise<Relation[]>;

  queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dtos: DTO[],
    query: Query<Relation>,
  ): Promise<Map<DTO, Relation[]>>;

  queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    entity: DTO | DTO[],
    query: Query<Relation>,
  ): Promise<Relation[] | Map<DTO, Relation[]>> {
    return Promise.reject(new NotImplementedException('queryRelations is not implemented'));
  }

  removeRelation<Relation>(relationName: string, id: string | number, relationId: string | number): Promise<DTO> {
    return Promise.reject(new NotImplementedException('removeRelation is not implemented'));
  }

  removeRelations<Relation>(relationName: string, id: string | number, relationIds: (string | number)[]): Promise<DTO> {
    return Promise.reject(new NotImplementedException('removeRelations is not implemented'));
  }

  setRelation<Relation>(relationName: string, id: string | number, relationId: string | number): Promise<DTO> {
    return Promise.reject(new NotImplementedException('setRelation is not implemented'));
  }

  updateMany<U extends DeepPartial<DTO>>(update: U, filter: Filter<DTO>): Promise<UpdateManyResponse> {
    return Promise.reject(new NotImplementedException('updateMany is not implemented'));
  }

  updateOne<U extends DeepPartial<DTO>>(id: string | number, update: U): Promise<DTO> {
    return Promise.reject(new NotImplementedException('updateOne is not implemented'));
  }
}
