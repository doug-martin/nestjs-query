import {
  AbstractQueryService,
  Query,
  DeleteManyResponse,
  DeleteOne,
  DeleteMany,
  UpdateManyResponse,
  UpdateMany,
  UpdateOne,
  CreateOne,
  CreateMany,
  DeepPartial,
  Class,
} from '@nestjs-query/core';
import { Repository, DeepPartial as TypeOrmDeepPartial } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FilterQueryBuilder } from '../query';

export class TypeormQueryService<Entity> extends AbstractQueryService<Entity> {
  constructor(protected repo: Repository<Entity>, readonly filterQueryBuilder = new FilterQueryBuilder(repo)) {
    super();
  }

  private get entityType(): Class<Entity> {
    return this.repo.target as Class<Entity>;
  }

  private get alias(): string {
    return this.repo.metadata.targetName;
  }

  async query(query: Query<Entity>): Promise<Entity[]> {
    return this.filterQueryBuilder.select(query).getMany();
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

  getById(id: string | number): Promise<Entity> {
    return this.repo.findOneOrFail(id);
  }

  createMany<C extends DeepPartial<Entity>>(create: CreateMany<Entity, C>): Promise<Entity[]> {
    return this.repo.save(create.items.map(item => this.ensureIsEntity(item)));
  }

  createOne<C extends DeepPartial<Entity>>(create: CreateOne<Entity, C>): Promise<Entity> {
    return this.repo.save(this.ensureIsEntity(create.item));
  }

  async deleteMany(deleteMany: DeleteMany<Entity>): Promise<DeleteManyResponse> {
    const deleteResult = await this.filterQueryBuilder.delete({ filter: deleteMany.filter }).execute();
    return this.createDeleteManyResponse(deleteResult.affected || 0);
  }

  async deleteOne(deleteOne: DeleteOne): Promise<Entity> {
    const entity = await this.getById(deleteOne.id);
    return this.repo.remove(entity);
  }

  async updateMany<U extends DeepPartial<Entity>>(update: UpdateMany<Entity, U>): Promise<UpdateManyResponse> {
    const updateResult = await this.filterQueryBuilder
      .update({ filter: update.filter })
      .set({ ...(update.update as QueryDeepPartialEntity<Entity>) })
      .execute();
    return this.createUpdateManyResponse(updateResult.affected || 0);
  }

  async updateOne<U extends DeepPartial<Entity>>(update: UpdateOne<Entity, U>): Promise<Entity> {
    const entity = await this.getById(update.id);
    return this.repo.save(this.repo.merge(entity, update.update as TypeOrmDeepPartial<Entity>));
  }

  private ensureIsEntity(obj: DeepPartial<Entity>): Entity {
    if (obj instanceof this.entityType) {
      return obj as Entity;
    }
    return plainToClass(this.entityType, obj);
  }
}
