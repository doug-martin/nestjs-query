import { AbstractQueryService, FindManyResponse, Query } from '@nestjs-query/core';
import { DeepPartial, Repository } from 'typeorm';
import { NotFoundException, Type } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FilterQueryBuilder } from '../query';

export class TypeormQueryService<Entity> extends AbstractQueryService<Entity> {
  constructor(protected repo: Repository<Entity>, readonly filterQueryBuilder = new FilterQueryBuilder(repo)) {
    super();
  }

  private get entityType(): Type<Entity> {
    return this.repo.target as Type<Entity>;
  }

  private get alias(): string {
    return this.repo.metadata.targetName;
  }

  async query(query: Query<Entity>): Promise<FindManyResponse<Entity>> {
    const [entities, totalCount] = await this.filterQueryBuilder.select(query).getManyAndCount();
    return this.createFindManyResponse(entities, totalCount);
  }

  async queryOne(query: Query<Entity>): Promise<Entity | undefined> {
    return this.filterQueryBuilder.select({ ...query, paging: { limit: 1, offset: 0 } }).getOne();
  }

  async getOne(query: Query<Entity>): Promise<Entity> {
    const entityOrUndefined = await this.queryOne(query);
    if (!entityOrUndefined) {
      throw new NotFoundException(`${this.alias} not found`);
    }
    return entityOrUndefined;
  }

  async findById(id: string | number): Promise<Entity | undefined> {
    return this.repo.findOne(id);
  }

  async getById(id: string | number): Promise<Entity> {
    return this.repo.findOneOrFail(id);
  }

  createMany(dtos: DeepPartial<Entity>[]): Promise<Entity[]> {
    return this.repo.save(dtos.map(dto => this.ensureIsEntity(dto)));
  }

  createOne(dto: DeepPartial<Entity>): Promise<Entity> {
    return this.repo.save(this.ensureIsEntity(dto));
  }

  async deleteMany(query: Query<Entity>): Promise<number> {
    const deleteResult = await this.filterQueryBuilder.delete(query).execute();
    return deleteResult.affected || 0;
  }

  async deleteOne(query: Query<Entity>): Promise<Entity> {
    const entity = await this.getOne(query);
    return this.repo.remove(entity);
  }

  async updateMany(query: Query<Entity>, dto: QueryDeepPartialEntity<Entity>): Promise<number> {
    const updateResult = await this.filterQueryBuilder
      .update(query)
      .set(dto)
      .execute();
    return updateResult.affected || 0;
  }

  async updateOne(query: Query<Entity>, dto: DeepPartial<Entity>): Promise<Entity> {
    const entity = await this.getOne(query);
    return this.repo.save(this.repo.merge(entity, dto));
  }

  private ensureIsEntity(obj: DeepPartial<Entity>): Entity {
    if (obj instanceof this.entityType) {
      return obj as Entity;
    }
    return plainToClass(this.entityType, obj);
  }
}
