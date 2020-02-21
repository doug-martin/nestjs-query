/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Class, Query } from '@nestjs-query/core';
import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { DriverUtils } from 'typeorm/driver/DriverUtils';
import { FilterQueryBuilder } from './filter-query.builder';
import { AbstractQueryBuilder } from './query-builder.abstract';

interface JoinCondition {
  leftHand: string;
  rightHand: string;
}
interface JoinColumn {
  target: Class<unknown> | string;
  alias: string;
  conditions: JoinCondition[];
}

type WhereCondition = {
  sql: string;
  params: ObjectLiteral;
};

type PrimaryKey = {
  databasePath: string;
  selectPath: string;
  propertyName: string;
};

interface RelationQuery<Relation, Entity> {
  from: Class<Relation>;
  fromAlias: string;
  fromPrimaryKeys: PrimaryKey[];
  entityIds: string[];
  entityIdSelects: string[];
  joins: JoinColumn[];
  whereCondition(entity: Entity, entityIndex: number): WhereCondition;
}

/**
 * @internal
 *
 * Class that will convert a Query into a `typeorm` Query Builder.
 */
export class RelationQueryBuilder<Entity, Relation> extends AbstractQueryBuilder<Entity> {
  private relationMetadata: RelationQuery<Relation, Entity> | undefined;

  readonly filterQueryBuilder: FilterQueryBuilder<Relation>;

  readonly relationRepo: Repository<Relation>;

  constructor(readonly repo: Repository<Entity>, readonly relation: string) {
    super(repo);
    this.relationRepo = this.repo.manager.getRepository<Relation>(this.relationMeta.from);
    this.filterQueryBuilder = new FilterQueryBuilder<Relation>(this.relationRepo);
  }

  select(entity: Entity | Entity[], query: Query<Relation>): SelectQueryBuilder<Relation> {
    const relationBuilder = this.createRelationQueryBuilder();
    return this.applyRelationFilter(relationBuilder, entity, query);
  }

  private applyRelationFilter(
    baseBuilder: SelectQueryBuilder<Relation>,
    entity: Entity | Entity[],
    query: Query<Relation>,
  ): SelectQueryBuilder<Relation> {
    const entityArr = Array.isArray(entity) ? entity : [entity];
    const { entityIds, fromPrimaryKeys, entityIdSelects } = this.relationMeta;
    const parameters = {};
    const fromPrimaryKeysIn =
      fromPrimaryKeys.length === 1
        ? fromPrimaryKeys[0].selectPath
        : `(${fromPrimaryKeys.map(pk => pk.selectPath).join(',')})`;
    const oredBuilder = entityArr
      .reduce((builder, e, index) => {
        return builder.orWhere(() => {
          const { subQuery, params } = this.createRelationSubQuery(e, index);
          // only apply filter and paging
          let filteredSubQuery = this.filterQueryBuilder.applyFilter(subQuery, query.filter);
          filteredSubQuery = this.filterQueryBuilder.applyPaging(filteredSubQuery, query.paging);
          Object.assign(parameters, params, filteredSubQuery.getParameters());
          return `(${fromPrimaryKeysIn} IN (${filteredSubQuery.getQuery()}))`;
        });
      }, baseBuilder)
      .setParameters(parameters);
    // force sorting by entity pks first so sub results are sorted properly
    const sortedBuilder = entityIds
      .reduce((builder, pk) => {
        return builder.addOrderBy(pk, 'ASC');
      }, oredBuilder)
      .addSelect(entityIdSelects);

    return this.filterQueryBuilder.applySorting(sortedBuilder, query.sorting);
  }

  private createRelationSubQuery(
    e: Entity,
    entityIndex: number,
  ): { subQuery: SelectQueryBuilder<Relation>; params: ObjectLiteral } {
    const meta = this.relationMeta;
    const baseBuilder = this.createRelationQueryBuilder().select(meta.fromPrimaryKeys.map(pk => pk.selectPath));
    const { sql, params } = meta.whereCondition(e, entityIndex);
    return { subQuery: baseBuilder.where(sql), params };
  }

  private createRelationQueryBuilder(): SelectQueryBuilder<Relation> {
    const meta = this.relationMeta;
    const queryBuilder = this.relationRepo.createQueryBuilder(meta.fromAlias);
    return meta.joins.reduce((qb, join) => {
      const conditions = join.conditions.map(({ leftHand, rightHand }) => `${leftHand} = ${rightHand}`);
      return qb.innerJoin(join.target, join.alias, conditions.join(' AND '));
    }, queryBuilder);
  }

  private get relationMeta(): RelationQuery<Relation, Entity> {
    if (this.relationMetadata) {
      return this.relationMetadata;
    }
    const relation = this.repo.metadata.relations.find(r => r.propertyName === this.relation);
    if (!relation) {
      throw new Error(`Unable to find entity for relation '${this.relation}'`);
    } else if (relation.isManyToOne || relation.isOneToOneOwner) {
      this.relationMetadata = this.getManyToOneOrOneToOneOwnerMeta(relation);
    } else if (relation.isOneToMany || relation.isOneToOneNotOwner) {
      this.relationMetadata = this.getOneToManyOrOneToOneNotOwnerMeta(relation);
    } else if (relation.isManyToManyOwner) {
      this.relationMetadata = this.getManyToManyOwnerMeta(relation);
    } else {
      // many-to-many non owner
      this.relationMetadata = this.getManyToManyNotOwnerMetadata(relation);
    }
    return this.relationMetadata;
  }

  getManyToOneOrOneToOneOwnerMeta(relation: RelationMetadata): RelationQuery<Relation, Entity> {
    const aliasName = relation.entityMetadata.name;
    const { primaryColumns } = relation.entityMetadata;
    const fromPrimaryKeys = relation.inverseRelation!.entityMetadata.primaryColumns.map(pk => ({
      selectPath: `${relation.propertyName}.${pk.propertyName}`,
      databasePath: pk.databasePath,
      propertyName: pk.propertyName,
    }));
    const { joinColumns } = relation;
    const joins: JoinColumn[] = [
      {
        target: relation.entityMetadata.target as Class<unknown>,
        alias: aliasName,
        conditions: joinColumns.map(joinColumn => ({
          leftHand: `${aliasName}.${joinColumn.propertyName}`,
          rightHand: `${relation.propertyName}.${joinColumn.referencedColumn!.propertyName}`,
        })),
      },
    ];
    const entityIds = primaryColumns.map(column => `${aliasName}.${column.propertyPath}`);
    const entityIdSelects = primaryColumns.map(
      column => `${aliasName}.${column.propertyPath} AS ${this.createEntityIdSelect(column.propertyPath)}`,
    );
    return {
      from: relation.type as Class<Relation>,
      fromAlias: relation.propertyName,
      fromPrimaryKeys,
      entityIds,
      entityIdSelects,
      joins,
      whereCondition(entity: Entity, entityIndex: number): WhereCondition {
        const params: ObjectLiteral = {};
        const sql = primaryColumns
          .map((column, columnIndex) => {
            const paramName = `${aliasName}_entity_${entityIndex}_${columnIndex}`;
            params[paramName] = column.getEntityValue(entity);
            return `${aliasName}.${column.propertyPath} = :${paramName}`;
          })
          .join(' AND ');
        return { sql, params };
      },
    };
  }

  getOneToManyOrOneToOneNotOwnerMeta(relation: RelationMetadata): RelationQuery<Relation, Entity> {
    const aliasName = relation.propertyName;
    const columns = relation.inverseRelation!.joinColumns;
    const fromPrimaryKeys: PrimaryKey[] = relation.inverseRelation!.entityMetadata.primaryColumns.map(pk => ({
      selectPath: `${aliasName}.${pk.propertyName}`,
      databasePath: pk.databasePath,
      propertyName: pk.propertyName,
    }));
    const entityIds = columns.map(joinColumn => `${aliasName}.${joinColumn.propertyPath}`);
    const entityIdSelects = columns.map(
      joinColumn =>
        `${aliasName}.${joinColumn.propertyPath} AS ${this.createEntityIdSelect(
          joinColumn.referencedColumn!.propertyPath,
        )}`,
    );
    return {
      from: relation.inverseRelation!.entityMetadata.target as Class<Relation>,
      fromAlias: aliasName,
      fromPrimaryKeys,
      entityIds,
      entityIdSelects,
      joins: [],
      whereCondition(entity: Entity, entityIndex: number): WhereCondition {
        const params: ObjectLiteral = {};
        const sql = columns
          .map((col, colIndex: number) => {
            const paramName = `${aliasName}_entity_${entityIndex}_${colIndex}`;
            params[paramName] = col.referencedColumn!.getEntityValue(entity);
            return `${aliasName}.${col.propertyPath} = :${paramName}`;
          })
          .join(' AND ');
        return { sql, params };
      },
    };
  }

  getManyToManyOwnerMeta(relation: RelationMetadata): RelationQuery<Relation, Entity> {
    const mainAlias = relation.propertyName;
    const joinAlias = relation.junctionEntityMetadata!.tableName;
    const joins: JoinColumn[] = [
      {
        target: joinAlias,
        alias: joinAlias,
        conditions: relation.inverseJoinColumns.map(inverseJoinColumn => ({
          leftHand: `${joinAlias}.${inverseJoinColumn.propertyName}`,
          rightHand: `${mainAlias}.${inverseJoinColumn.referencedColumn!.propertyName}`,
        })),
      },
    ];
    const fromPrimaryKeys = relation.inverseRelation!.entityMetadata.primaryColumns.map(pk => ({
      selectPath: `${mainAlias}.${pk.propertyName}`,
      databasePath: pk.databasePath,
      propertyName: pk.propertyName,
    }));
    const entityIds = relation.joinColumns.map(joinColumn => `${joinAlias}.${joinColumn.propertyName}`);
    const entityIdSelects = relation.joinColumns.map(
      joinColumn =>
        `${joinAlias}.${joinColumn.propertyName} AS ${this.createEntityIdSelect(
          joinColumn.referencedColumn!.propertyPath,
        )}`,
    );
    return {
      from: relation.type as Class<Relation>,
      fromAlias: mainAlias,
      fromPrimaryKeys,
      entityIds,
      entityIdSelects,
      joins,
      whereCondition(entity: Entity, entityIndex: number): WhereCondition {
        const params: ObjectLiteral = {};
        const sql = relation.joinColumns
          .map(joinColumn => {
            const paramName = `${joinColumn.propertyName}_${entityIndex}`;
            params[paramName] = joinColumn.referencedColumn!.getEntityValue(entity);
            return `${joinAlias}.${joinColumn.propertyName} = :${paramName}`;
          })
          .join(' AND ');
        return { sql, params };
      },
    };
  }

  getManyToManyNotOwnerMetadata(relation: RelationMetadata): RelationQuery<Relation, Entity> {
    const mainAlias = relation.propertyName;
    const joinAlias = relation.junctionEntityMetadata!.tableName;
    const joins = [
      {
        target: joinAlias,
        alias: joinAlias,
        conditions: relation.inverseRelation!.joinColumns.map(joinColumn => ({
          leftHand: `${joinAlias}.${joinColumn.propertyName}`,
          rightHand: `${mainAlias}.${joinColumn.referencedColumn!.propertyName}`,
        })),
      },
    ];
    const fromPrimaryKeys = relation.inverseRelation!.entityMetadata.primaryColumns.map(pk => ({
      selectPath: `${mainAlias}.${pk.propertyName}`,
      databasePath: pk.databasePath,
      propertyName: pk.propertyName,
    }));
    const entityIds = relation.inverseRelation!.inverseJoinColumns.map(
      inverseJoinColumn => `${joinAlias}.${inverseJoinColumn.propertyName}`,
    );
    const entityIdSelects = relation.inverseRelation!.inverseJoinColumns.map(
      inverseJoinColumn =>
        `${joinAlias}.${inverseJoinColumn.propertyName} AS ${this.createEntityIdSelect(
          inverseJoinColumn.referencedColumn!.propertyPath,
        )}`,
    );
    return {
      from: relation.type as Class<Relation>,
      fromAlias: mainAlias,
      fromPrimaryKeys,
      entityIds,
      entityIdSelects,
      joins,
      whereCondition(entity: Entity, entityIndex: number): WhereCondition {
        const params: ObjectLiteral = {};
        const sql = relation
          .inverseRelation!.inverseJoinColumns.map(inverseJoinColumn => {
            const paramName = `${inverseJoinColumn.propertyName}_${entityIndex}`;
            params[paramName] = inverseJoinColumn.referencedColumn!.getEntityValue(entity);
            return `${joinAlias}.${inverseJoinColumn.propertyName} = :${paramName}`;
          })
          .join(' AND ');
        return { sql, params };
      },
    };
  }

  private createEntityIdSelect(propertyPath: string): string {
    return this.escape(`__nestjsQueryEntityId_${propertyPath}__`);
  }

  static isEntityIdCol(colName: string): boolean {
    return /^__nestjsQueryEntityId_(.*)__$/.test(colName);
  }

  static parseEntityIdFromName(colName: string): string {
    return colName.replace(/^__nestjsQueryEntityId_/, '').replace(/__$/, '');
  }

  getRelationPrimaryKeysPropertyNameAndColumnsName(): { columnName: string; propertyName: string }[] {
    return this.relationMeta.fromPrimaryKeys.map(pk => ({
      propertyName: pk.propertyName,
      columnName: DriverUtils.buildColumnAlias(
        this.relationRepo.manager.connection.driver,
        this.relationMeta.fromAlias,
        pk.databasePath,
      ),
    }));
  }
}
