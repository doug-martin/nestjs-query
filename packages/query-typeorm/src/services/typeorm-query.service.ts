import {
  AssemblerService,
  Query,
  DeleteManyResponse,
  UpdateManyResponse,
  DeepPartial,
  Class,
  QueryService,
  Filter,
  Assembler,
  getQueryServiceDTO,
} from '@nestjs-query/core';
import { Repository, DeepPartial as TypeOrmDeepPartial, RelationQueryBuilder } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { FilterQueryBuilder } from '../query';

/**
 * Base class for all query services that use a `typeorm` Repository.
 *
 * @example
 *
 * ```ts
 * @QueryService(TodoItemDTO)
 * export class TodoItemService extends TypeOrmQueryService<TodoItemDTO, TodoItemEntity> {
 *   constructor(
 *      @InjectRepository(TodoItemEntity) repo: Repository<TodoItemEntity>,
 *   ) {
 *     super(repo);
 *   }
 * }
 * ```
 */
export abstract class TypeOrmQueryService<DTO, Entity = DTO> implements QueryService<DTO> {
  readonly assemblerService: AssemblerService;

  readonly DTOClass: Class<DTO>;

  readonly filterQueryBuilder: FilterQueryBuilder<Entity>;

  protected constructor(
    readonly repo: Repository<Entity>,
    assemblerService?: AssemblerService,
    filterQueryBuilder?: FilterQueryBuilder<Entity>,
  ) {
    const DTOClass = getQueryServiceDTO(this.constructor as Class<QueryService<DTO>>);
    if (!DTOClass) {
      throw new Error(
        `Unable to determine DTO type for ${this.constructor.name}. Did you annotate your service with @QueryService?`,
      );
    }
    this.filterQueryBuilder = filterQueryBuilder ?? new FilterQueryBuilder<Entity>(this.repo);
    this.assemblerService = assemblerService ?? AssemblerService.getInstance();
    this.DTOClass = DTOClass;
  }

  get EntityClass(): Class<Entity> {
    return this.repo.target as Class<Entity>;
  }

  private get assembler(): Assembler<DTO, Entity> {
    return this.assemblerService.getAssembler(this.DTOClass, this.EntityClass);
  }

  /**
   * Query for multiple entities, using a Query from `@nestjs-query/core`.
   *
   * @example
   * ```ts
   * const todoItems = await this.service.query({
   *   filter: { title: { eq: 'Foo' } },
   *   paging: { limit: 10 },
   *   sorting: [{ field: "create", direction: SortDirection.DESC }],
   * });
   * ```
   * @param query - The Query used to filter, page, and sort rows.
   */
  async query(query: Query<DTO>): Promise<DTO[]> {
    return this.assembler.convertAsyncToDTOs(
      this.filterQueryBuilder.select(this.assembler.convertQuery(query)).getMany(),
    );
  }

  /**
   * Query for an array of relations.
   * @param RelationClass - The class to serialize the relations into.
   * @param dto - The dto to query relations for.
   * @param relationName - The name of relation to query for.
   * @param query - A query to filter, page or sort relations.
   */
  async queryRelations<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO,
    query: Query<Relation>,
  ): Promise<Relation[]> {
    const assembler = this.assemblerService.getAssembler(RelationClass, this.getRelationEntity(relationName));
    return assembler.convertAsyncToDTOs(
      this.filterQueryBuilder
        .selectRelation(this.assembler.convertToEntity(dto), relationName, assembler.convertQuery(query))
        .getMany(),
    );
  }

  /**
   * Finds a single relation.
   * @param RelationClass - The class to serialize the relation into.
   * @param dto - The dto to find the relation for.
   * @param relationName - The name of the relation to query for.
   */
  async findRelation<Relation>(
    RelationClass: Class<Relation>,
    relationName: string,
    dto: DTO,
  ): Promise<Relation | undefined> {
    const assembler = this.assemblerService.getAssembler(RelationClass, this.getRelationEntity(relationName));
    const relationEntity = await this.createRelationQueryBuilder(
      this.assembler.convertToEntity(dto),
      relationName,
    ).loadOne<Relation>();
    return relationEntity ? assembler.convertToDTO(relationEntity) : undefined;
  }

  /**
   * Add a single relation.
   * @param id - The id of the entity to add the relation to.
   * @param relationName - The name of the relation to query for.
   * @param relationIds - The ids of relations to add.
   */
  async addRelations<Relation>(
    relationName: string,
    id: string | number,
    relationIds: (string | number)[],
  ): Promise<DTO> {
    const entity = await this.repo.findOneOrFail(id);
    await this.createRelationQueryBuilder(entity, relationName).add(relationIds);
    return this.assembler.convertToDTO(entity);
  }

  /**
   * Set the relation on the entity.
   *
   * @param id - The id of the entity to set the relation on.
   * @param relationName - The name of the relation to query for.
   * @param relationId - The id of the relation to set on the entity.
   */
  async setRelation<Relation>(relationName: string, id: string | number, relationId: string | number): Promise<DTO> {
    const entity = await this.repo.findOneOrFail(id);
    await this.createRelationQueryBuilder(entity, relationName).set(relationId);
    return this.assembler.convertToDTO(entity);
  }

  /**
   * Find an entity by it's `id`.
   *
   * @example
   * ```ts
   * const todoItem = await this.service.findById(1);
   * ```
   * @param id - The id of the record to find.
   */
  async findById(id: string | number): Promise<DTO | undefined> {
    const entity = await this.repo.findOne(id);
    if (!entity) {
      return undefined;
    }
    return this.assembler.convertToDTO(entity);
  }

  /**
   * Removes multiple relations.
   * @param id - The id of the entity to add the relation to.
   * @param relationName - The name of the relation to query for.
   * @param relationIds - The ids of the relations to add.
   */
  async removeRelations<Relation>(
    id: string | number,
    relationName: string,
    relationIds: (string | number)[],
  ): Promise<DTO> {
    const entity = await this.repo.findOneOrFail(id);
    await this.createRelationQueryBuilder(entity, relationName).remove(relationIds);
    return this.assembler.convertToDTO(entity);
  }

  /**
   * Remove the relation on the entity.
   *
   * @param id - The id of the entity to set the relation on.
   * @param relationName - The name of the relation to query for.
   * @param relationId - The id of the relation to set on the entity.
   */
  async removeRelation<Relation>(id: string | number, relationName: string, relationId: string | number): Promise<DTO> {
    const entity = await this.repo.findOneOrFail(id);
    await this.createRelationQueryBuilder(entity, relationName).remove(relationId);
    return this.assembler.convertToDTO(entity);
  }

  /**
   * Gets an entity by it's `id`. If the entity is not found a rejected promise is returned.
   *
   * @example
   * ```ts
   * try {
   *   const todoItem = await this.service.getById(1);
   * } catch(e) {
   *   console.error('Unable to find entity with id = 1');
   * }
   * ```
   * @param id - The id of the record to find.
   */
  async getById(id: string | number): Promise<DTO> {
    return this.assembler.convertAsyncToDTO(this.repo.findOneOrFail(id));
  }

  /**
   * Creates a single entity.
   *
   * @example
   * ```ts
   * const todoItem = await this.service.createOne({title: 'Todo Item', completed: false });
   * ```
   * @param record - The entity to create.
   */
  async createOne<C extends DeepPartial<DTO>>(record: C): Promise<DTO> {
    const c = this.assembler.convertToEntity((record as unknown) as DTO);
    return this.assembler.convertAsyncToDTO(this.repo.save(c));
  }

  /**
   * Create multiple entities.
   *
   * @example
   * ```ts
   * const todoItem = await this.service.createMany([
   *   {title: 'Todo Item 1', completed: false },
   *   {title: 'Todo Item 2', completed: true },
   * ]);
   * ```
   * @param records - The entities to create.
   */
  createMany<C extends DeepPartial<DTO>>(records: C[]): Promise<DTO[]> {
    const { assembler } = this;
    const converted = records.map(c => assembler.convertToEntity((c as unknown) as DTO));
    return this.assembler.convertAsyncToDTOs(this.repo.save(converted));
  }

  /**
   * Update an entity.
   *
   * @example
   * ```ts
   * const updatedEntity = await this.service.updateOne(1, { completed: true });
   * ```
   * @param id - The `id` of the record.
   * @param update - A `Partial` of the entity with fields to update.
   */
  async updateOne<U extends DeepPartial<DTO>>(id: number | string, update: U): Promise<DTO> {
    const entity = await this.repo.findOneOrFail(id);
    return this.assembler.convertAsyncToDTO(
      this.repo.save(this.repo.merge(entity, update as TypeOrmDeepPartial<Entity>)),
    );
  }

  /**
   * Update multiple entities with a `@nestjs-query/core` Filter.
   *
   * @example
   * ```ts
   * const { updatedCount } = await this.service.updateMany(
   *   { completed: true }, // the update to apply
   *   { title: { eq: 'Foo Title' } } // Filter to find records to update
   * );
   * ```
   * @param update - A `Partial` of entity with the fields to update
   * @param filter - A Filter used to find the records to update
   */
  async updateMany<U extends DeepPartial<DTO>>(update: U, filter: Filter<DTO>): Promise<UpdateManyResponse> {
    const updateResult = await this.filterQueryBuilder
      .update(this.assembler.convertQuery({ filter }))
      .set({ ...(update as QueryDeepPartialEntity<Entity>) })
      .execute();
    return { updatedCount: updateResult.affected || 0 };
  }

  /**
   * Delete an entity by `id`.
   *
   * @example
   *
   * ```ts
   * const deletedTodo = await this.service.deleteOne(1);
   * ```
   *
   * @param id - The `id` of the entity to delete.
   */
  async deleteOne(id: string | number): Promise<DTO> {
    const entity = await this.repo.findOneOrFail(id);
    return this.assembler.convertAsyncToDTO(this.repo.remove(entity));
  }

  /**
   * Delete multiple records with a `@nestjs-query/core` `Filter`.
   *
   * @example
   *
   * ```ts
   * const { deletedCount } = this.service.deleteMany({
   *   created: { lte: new Date('2020-1-1') }
   * });
   * ```
   *
   * @param filter - A `Filter` to find records to delete.
   */
  async deleteMany(filter: Filter<DTO>): Promise<DeleteManyResponse> {
    const deleteResult = await this.filterQueryBuilder.delete(this.assembler.convertQuery({ filter })).execute();
    return { deletedCount: deleteResult.affected || 0 };
  }

  private createRelationQueryBuilder(entity: Entity, relationName: string): RelationQueryBuilder<Entity> {
    return this.repo
      .createQueryBuilder()
      .relation(relationName)
      .of(entity);
  }

  private getRelationEntity(relationName: string): Class<unknown> {
    const relationMeta = this.repo.metadata.relations.find(r => r.propertyName === relationName);
    if (!relationMeta) {
      throw new Error(`Unable to find relation ${relationName} on ${this.EntityClass.name}`);
    }
    return relationMeta.type as Class<unknown>;
  }
}
