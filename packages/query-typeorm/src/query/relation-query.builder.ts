/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Class, Query } from '@nestjs-query/core';
import { Repository, SelectQueryBuilder, ObjectLiteral, Brackets } from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { FilterQueryBuilder } from './filter-query.builder';

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

interface RelationQuery<Relation, Entity> {
  from: Class<Relation>;
  fromAlias: string;
  joins: JoinColumn[];
  whereCondition(entity: Entity): WhereCondition;
}

/**
 * @internal
 *
 * Class that will convert a Query into a `typeorm` Query Builder.
 */
export class RelationQueryBuilder<Entity, Relation> {
  private relationMetadata: RelationQuery<Relation, Entity> | undefined;

  readonly filterQueryBuilder: FilterQueryBuilder<Relation>;

  readonly relationRepo: Repository<Relation>;

  constructor(readonly repo: Repository<Entity>, readonly relation: string) {
    this.relationRepo = this.repo.manager.getRepository<Relation>(this.relationMeta.from);
    this.filterQueryBuilder = new FilterQueryBuilder<Relation>(this.relationRepo);
  }

  select(entity: Entity, query: Query<Relation>): SelectQueryBuilder<Relation> {
    let relationBuilder = this.createRelationQueryBuilder(entity);
    relationBuilder = this.filterQueryBuilder.applyFilter(relationBuilder, query.filter, relationBuilder.alias);
    relationBuilder = this.filterQueryBuilder.applyPaging(relationBuilder, query.paging);
    return this.filterQueryBuilder.applySorting(relationBuilder, query.sorting, relationBuilder.alias);
  }

  private createRelationQueryBuilder(entity: Entity): SelectQueryBuilder<Relation> {
    const meta = this.relationMeta;
    const queryBuilder = this.relationRepo.createQueryBuilder(meta.fromAlias);
    const joinedBuilder = meta.joins.reduce((qb, join) => {
      const conditions = join.conditions.map(({ leftHand, rightHand }) => `${leftHand} = ${rightHand}`);
      return qb.innerJoin(join.target, join.alias, conditions.join(' AND '));
    }, queryBuilder);
    return joinedBuilder.where(
      new Brackets((bqb) => {
        const where = meta.whereCondition(entity);
        bqb.andWhere(where.sql, where.params);
      }),
    );
  }

  private get relationMeta(): RelationQuery<Relation, Entity> {
    if (this.relationMetadata) {
      return this.relationMetadata;
    }
    const relation = this.repo.metadata.relations.find((r) => r.propertyName === this.relation);
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
    const { joinColumns } = relation;
    const joins: JoinColumn[] = [
      {
        target: relation.entityMetadata.target as Class<unknown>,
        alias: aliasName,
        conditions: joinColumns.map((joinColumn) => ({
          leftHand: `${aliasName}.${joinColumn.propertyName}`,
          rightHand: `${relation.propertyName}.${joinColumn.referencedColumn!.propertyName}`,
        })),
      },
    ];
    return {
      from: relation.type as Class<Relation>,
      fromAlias: relation.propertyName,
      joins,
      whereCondition(entity: Entity): WhereCondition {
        const params: ObjectLiteral = {};
        const sql = primaryColumns
          .map((column, columnIndex) => {
            const paramName = `${aliasName}_entity_${columnIndex}`;
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
    return {
      from: relation.inverseRelation!.entityMetadata.target as Class<Relation>,
      fromAlias: aliasName,
      joins: [],
      whereCondition(entity: Entity): WhereCondition {
        const params: ObjectLiteral = {};
        const sql = columns
          .map((col, colIndex: number) => {
            const paramName = `${aliasName}_entity_${colIndex}`;
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
        conditions: relation.inverseJoinColumns.map((inverseJoinColumn) => ({
          leftHand: `${joinAlias}.${inverseJoinColumn.propertyName}`,
          rightHand: `${mainAlias}.${inverseJoinColumn.referencedColumn!.propertyName}`,
        })),
      },
    ];
    return {
      from: relation.type as Class<Relation>,
      fromAlias: mainAlias,
      joins,
      whereCondition(entity: Entity): WhereCondition {
        const params: ObjectLiteral = {};
        const sql = relation.joinColumns
          .map((joinColumn) => {
            const paramName = joinColumn.propertyName;
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
        conditions: relation.inverseRelation!.joinColumns.map((joinColumn) => ({
          leftHand: `${joinAlias}.${joinColumn.propertyName}`,
          rightHand: `${mainAlias}.${joinColumn.referencedColumn!.propertyName}`,
        })),
      },
    ];
    return {
      from: relation.type as Class<Relation>,
      fromAlias: mainAlias,
      joins,
      whereCondition(entity: Entity): WhereCondition {
        const params: ObjectLiteral = {};
        const sql = relation
          .inverseRelation!.inverseJoinColumns.map((inverseJoinColumn) => {
            const paramName = `${inverseJoinColumn.propertyName}`;
            params[paramName] = inverseJoinColumn.referencedColumn!.getEntityValue(entity);
            return `${joinAlias}.${inverseJoinColumn.propertyName} = :${paramName}`;
          })
          .join(' AND ');
        return { sql, params };
      },
    };
  }
}
