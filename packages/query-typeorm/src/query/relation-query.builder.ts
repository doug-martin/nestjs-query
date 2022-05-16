/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AggregateQuery, Class, Query } from '@ptc-org/nestjs-query-core';
import { Repository, SelectQueryBuilder, ObjectLiteral, Brackets } from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { DriverUtils } from 'typeorm/driver/DriverUtils';
import { FilterQueryBuilder } from './filter-query.builder';
import { AggregateBuilder } from './aggregate.builder';
import lodashFilter from 'lodash.filter';

interface JoinCondition {
  leftHand: string;
  rightHand: string;
}

interface JoinColumn {
  target: Class<unknown> | string;
  alias: string;
  conditions: JoinCondition[];
}

type SQLFragment = {
  sql: string;
  params: ObjectLiteral;
};

type UnionSQLFragment = {
  joinCondition?: string;
} & SQLFragment;

type PrimaryKey = {
  databasePath: string;
  selectPath: string;
  propertyName: string;
};

interface RelationQuery<Relation, Entity> {
  relation: RelationMetadata,
  from: Class<Relation>;
  fromAlias: string;
  fromPrimaryKeys: PrimaryKey[];
  joins: JoinColumn[];

  mapRelations<RawRelation>(entity: Entity, relations: Relation[], rawRelations: RawRelation[]): Relation[];

  batchSelect(qb: SelectQueryBuilder<Relation>, entities: Entity[]): SelectQueryBuilder<Relation>;

  whereCondition(entity: Entity): SQLFragment;
}

type UnionQueries = {
  unions: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: ObjectLiteral;
};

export type EntityIndexRelation<Relation> = Relation & {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __nestjsQuery__entityIndex__: number;
};

/**
 * @internal
 *
 * Class that will convert a Query into a `typeorm` Query Builder.
 */
export class RelationQueryBuilder<Entity, Relation> {
  private relationMetadata: RelationQuery<Relation, Entity> | undefined;

  readonly filterQueryBuilder: FilterQueryBuilder<Relation>;

  readonly relationRepo: Repository<Relation>;

  private paramCount: number;

  constructor(readonly repo: Repository<Entity>, readonly relation: string) {
    this.relationRepo = this.repo.manager.getRepository<Relation>(this.relationMeta.from);
    this.filterQueryBuilder = new FilterQueryBuilder<Relation>(this.relationRepo);
    this.paramCount = 0;
  }

  public select(entity: Entity, query: Query<Relation>): SelectQueryBuilder<Relation> {
    const hasRelations = this.filterQueryBuilder.filterHasRelations(query.filter);

    let relationBuilder = this.createRelationQueryBuilder(entity);
    relationBuilder = hasRelations
      ? this.filterQueryBuilder.applyRelationJoinsRecursive(relationBuilder, this.filterQueryBuilder.getReferencedRelationsRecursive(this.relationRepo.metadata, query.filter))
      : relationBuilder;

    relationBuilder = this.filterQueryBuilder.applyFilter(relationBuilder, query.filter, relationBuilder.alias);
    relationBuilder = this.filterQueryBuilder.applyPaging(relationBuilder, query.paging);

    return this.filterQueryBuilder.applySorting(relationBuilder, query.sorting, relationBuilder.alias);
  }

  public batchSelect(entities: Entity[], query: Query<Relation>): SelectQueryBuilder<Relation> {
    const hasRelations = this.filterQueryBuilder.filterHasRelations(query.filter);
    let qb = this.relationRepo.createQueryBuilder(this.relationMeta.fromAlias);
    qb = hasRelations
      ? this.filterQueryBuilder.applyRelationJoinsRecursive(qb, this.filterQueryBuilder.getReferencedRelationsRecursive(this.relationRepo.metadata, query.filter))
      : qb;
    qb = this.filterQueryBuilder.applyFilter(qb, query.filter, qb.alias);
    qb = this.filterQueryBuilder.applySorting(qb, query.sorting, qb.alias);
    qb = this.filterQueryBuilder.applyPaging(qb, query.paging);

    return this.relationMeta.batchSelect(qb, entities);
  }

  public batchAggregate(
    entities: Entity[],
    query: Query<Relation>,
    aggregateQuery: AggregateQuery<Relation>
  ): SelectQueryBuilder<EntityIndexRelation<Record<string, unknown>>> {
    const selects = [...AggregateBuilder.getAggregateSelects(aggregateQuery), this.entityIndexColName].map((c) =>
      this.escapeName(c)
    );

    const unionFragment = this.createUnionAggregateSubQuery(entities, query, aggregateQuery);

    return this.relationRepo.manager.connection
      .createQueryBuilder()
      .select(selects)
      .from<EntityIndexRelation<Record<string, unknown>>>(`(${unionFragment.sql})`, this.unionAlias)
      .setParameters(unionFragment.params);
  }

  public aggregate(entity: Entity, query: Query<Relation>, aggregateQuery: AggregateQuery<Relation>): SelectQueryBuilder<Relation> {
    let relationBuilder = this.createRelationQueryBuilder(entity);
    relationBuilder = this.filterQueryBuilder.applyAggregate(relationBuilder, aggregateQuery, relationBuilder.alias);
    relationBuilder = this.filterQueryBuilder.applyFilter(relationBuilder, query.filter, relationBuilder.alias);
    relationBuilder = this.filterQueryBuilder.applyAggregateSorting(
      relationBuilder,
      aggregateQuery.groupBy,
      relationBuilder.alias
    );
    relationBuilder = this.filterQueryBuilder.applyGroupBy(
      relationBuilder,
      aggregateQuery.groupBy,
      relationBuilder.alias
    );
    return relationBuilder;
  }

  public get relationMeta(): RelationQuery<Relation, Entity> {
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

  private createUnionAggregateSubQuery(
    entities: Entity[],
    query: Query<Relation>,
    aggregateQuery: AggregateQuery<Relation>
  ): UnionSQLFragment {
    const { fromAlias } = this.relationMeta;
    const subQueries = entities.map((e, index) => {
      const subQuery = this.aggregate(e, query, aggregateQuery);
      return subQuery.addSelect(`${index}`, this.entityIndexColName);
    });
    const unionSqls = subQueries.reduce(
      ({ unions, parameters }: UnionQueries, sq) => ({
        unions: [...unions, sq.getQuery()],
        parameters: { ...parameters, ...sq.getParameters() }
      }),
      { unions: [], parameters: {} }
    );

    const unionSql = unionSqls.unions
      .map((u) => `SELECT *
                   FROM (${u}) AS ${this.escapeName(fromAlias)}`)
      .join(' UNION ALL ');
    return { sql: unionSql, params: unionSqls.parameters };
  }

  private createRelationQueryBuilder(entity: Entity): SelectQueryBuilder<Relation> {
    const meta = this.relationMeta;
    const queryBuilder = this.relationRepo.createQueryBuilder(meta.fromAlias);

    const joinedBuilder = meta.joins.reduce((qb, join) => {
      const conditions = join.conditions.map(({ leftHand, rightHand }) => `${leftHand} = ${rightHand}`);
      return qb.innerJoin(join.target, join.alias, conditions.join(' AND '));
    }, queryBuilder);

    return joinedBuilder.where(new Brackets((bqb) => {
      const where = meta.whereCondition(entity);

      bqb.andWhere(where.sql, where.params);
    }));
  }

  private getManyToOneOrOneToOneOwnerMeta(relation: RelationMetadata): RelationQuery<Relation, Entity> {
    const aliasName = relation.entityMetadata.name;
    const { primaryColumns } = relation.entityMetadata;
    const { joinColumns } = relation;
    const joins: JoinColumn[] = [
      {
        target: relation.entityMetadata.target as Class<unknown>,
        alias: aliasName,
        conditions: joinColumns.map((joinColumn) => ({
          leftHand: `${aliasName}.${joinColumn.propertyName}`,
          rightHand: `${relation.propertyName}.${joinColumn.referencedColumn!.propertyName}`
        }))
      }
    ];
    const fromPrimaryKeys = relation.inverseEntityMetadata.primaryColumns.map((pk) => ({
      selectPath: `${relation.propertyName}.${pk.propertyName}`,
      databasePath: pk.databasePath,
      propertyName: pk.propertyName
    }));

    return {
      relation,
      from: relation.type as Class<Relation>,
      fromAlias: relation.propertyName,
      fromPrimaryKeys,
      joins,

      mapRelations: (entity: Entity, relations: Relation[], rawRelations: any[]): Relation[] => {
        const rawFilter = primaryColumns.reduce((columns, column) => ({
          ...columns,

          [DriverUtils.buildAlias(
            this.relationRepo.manager.connection.driver,
            aliasName,
            column.databasePath
          )]: column.getEntityValue(entity)
        }), {} as Partial<Entity>);

        // First filter the raw relations with the PK of the entity, then filter the relations
        // with the PK of the raw relation
        return lodashFilter(rawRelations, rawFilter).reduce((entityRelations, rawRelation) => {
          const filter = this.getRelationPrimaryKeysPropertyNameAndColumnsName().reduce((columns, column) => ({
            ...columns,

            [column.propertyName]: rawRelation[column.columnName]
          }), {} as Partial<Entity>);

          return entityRelations.concat(lodashFilter(relations, filter));
        }, [] as Relation[]);
      },

      batchSelect: (qb, entities) => {
        const joinCondition = joinColumns.map((column) => {
          return `${aliasName}.${column.propertyName} = ${relation.propertyName}.${column.referencedColumn!.propertyName}`;
        }).join(' AND ');

        const whereParams = {};
        const andSelect = [];
        const whereCondition = primaryColumns.map((column) => {
          const paramName = this.getParamName(aliasName);

          whereParams[paramName] = entities.map((entity) => column.getEntityValue(entity));

          // Also select the columns, so we can use them to map later
          andSelect.push(`${aliasName}.${column.propertyPath}`);
          return `${aliasName}.${column.propertyPath} IN (:...${paramName})`;
        }).join(' AND ');

        return qb.leftJoin(relation.entityMetadata.target as Class<unknown>, aliasName, joinCondition)
          .addSelect(andSelect)
          .andWhere(whereCondition, whereParams);
      },

      whereCondition: (entity: Entity): SQLFragment => {
        const params: ObjectLiteral = {};

        const sql = primaryColumns
          .map((column) => {
            const paramName = this.getParamName(aliasName);

            params[paramName] = column.getEntityValue(entity);
            return `${aliasName}.${column.propertyPath} = :${paramName}`;
          })
          .join(' AND ');

        return { sql, params };
      }
    };
  }

  private getOneToManyOrOneToOneNotOwnerMeta(relation: RelationMetadata): RelationQuery<Relation, Entity> {
    const aliasName = relation.propertyName;
    const columns = relation.inverseRelation!.joinColumns;
    const fromPrimaryKeys: PrimaryKey[] = relation.inverseEntityMetadata.primaryColumns.map((pk) => ({
      selectPath: `${aliasName}.${pk.propertyName}`,
      databasePath: pk.databasePath,
      propertyName: pk.propertyName
    }));
    return {
      relation,
      from: relation.inverseRelation!.entityMetadata.target as Class<Relation>,
      fromAlias: aliasName,
      fromPrimaryKeys,
      joins: [],
      mapRelations: (entity: Entity, relations: Relation[]): Relation[] => {
        const filter = columns.reduce((columns, column) => ({
          ...columns,
          [column.propertyName]: column.referencedColumn!.getEntityValue(entity)
        }), {} as Partial<Entity>);

        return lodashFilter(relations, filter) as Relation[];
      },
      batchSelect: (qb, entities: Entity[]) => {
        const params = {};

        const sql = columns.map((column) => {
          const paramName = this.getParamName(aliasName);
          params[paramName] = entities.map((entity) => column.referencedColumn!.getEntityValue(entity));

          return `${aliasName}.${column.propertyPath} IN (:...${paramName})`;
        }).join(' AND ');

        return qb.andWhere(sql, params);
      },
      whereCondition: (entity: Entity): SQLFragment => {
        const params: ObjectLiteral = {};

        const sql = columns.map((col) => {
          const paramName = this.getParamName(aliasName);

          params[paramName] = col.referencedColumn!.getEntityValue(entity);
          return `${aliasName}.${col.propertyPath} = :${paramName}`;
        }).join(' AND ');

        return { sql, params };
      }
    };
  }

  private getManyToManyOwnerMeta(relation: RelationMetadata): RelationQuery<Relation, Entity> {
    const mainAlias = relation.propertyName;
    const joinAlias = relation.junctionEntityMetadata!.tableName;
    const joins: JoinColumn[] = [
      {
        target: joinAlias,
        alias: joinAlias,
        conditions: relation.inverseJoinColumns.map((inverseJoinColumn) => ({
          leftHand: `${joinAlias}.${inverseJoinColumn.propertyName}`,
          rightHand: `${mainAlias}.${inverseJoinColumn.referencedColumn!.propertyName}`
        }))
      }
    ];

    const fromPrimaryKeys = relation.inverseEntityMetadata.primaryColumns.map((pk) => ({
      selectPath: `${mainAlias}.${pk.propertyName}`,
      databasePath: pk.databasePath,
      propertyName: pk.propertyName
    }));

    return {
      relation,
      from: relation.type as Class<Relation>,
      fromAlias: mainAlias,
      fromPrimaryKeys,
      joins,

      mapRelations: <RawRelation>(entity: Entity, relations: Relation[], rawRelations: RawRelation[]): Relation[] => {
        const rawFilter = relation.joinColumns.reduce((columns, column) => ({
          ...columns,

          [`${joinAlias}_${column.propertyName}`]: column.referencedColumn.getEntityValue(entity)
        }), {} as Partial<Entity>);

        // First filter the raw relations with the PK of the entity, then filter the relations
        // with the PK of the raw relation
        return lodashFilter(rawRelations, rawFilter).reduce((entityRelations, rawRelation) => {
          const filter = this.getRelationPrimaryKeysPropertyNameAndColumnsName().reduce((columns, column) => ({
            ...columns,
            [column.propertyName]: rawRelation[column.columnName]
          }), {} as Partial<Entity>);

          return entityRelations.concat(lodashFilter(relations, filter) as any);
        }, [] as Relation[]);
      },

      batchSelect: (qb, entities: Entity[]) => {
        const params = {};
        const andSelect = [];

        const sql = relation.joinColumns.map((column) => {
          const paramName = this.getParamName(column.propertyName);
          params[paramName] = entities.map((entity) => column.referencedColumn!.getEntityValue(entity));

          // We also want to select the field, so we can map them back in the mapper
          andSelect.push(`${joinAlias}.${column.propertyName} AS ${joinAlias}_${column.propertyName}`);
          return `${joinAlias}.${column.propertyName} IN (:...${paramName})`;
        }).join(' AND ');

        // Add the needed joins
        return joins.reduce((qb, join) => {
          const conditions = join.conditions.map(({ leftHand, rightHand }) => `${leftHand} = ${rightHand}`);

          return qb.innerJoin(join.target, join.alias, conditions.join(' AND '));
        }, qb)
          .addSelect(andSelect)
          .andWhere(sql, params);
      },

      whereCondition: (entity: Entity): SQLFragment => {
        const params: ObjectLiteral = {};

        const sql = relation.joinColumns
          .map((joinColumn) => {
            const paramName = this.getParamName(joinColumn.propertyName);

            params[paramName] = joinColumn.referencedColumn!.getEntityValue(entity);
            return `${joinAlias}.${joinColumn.propertyName} = :${paramName}`;
          })
          .join(' AND ');

        return { sql, params };
      }
    };
  }

  private getManyToManyNotOwnerMetadata(relation: RelationMetadata): RelationQuery<Relation, Entity> {
    const mainAlias = relation.propertyName;
    const joinAlias = relation.junctionEntityMetadata!.tableName;
    const joins = [
      {
        target: joinAlias,
        alias: joinAlias,
        conditions: relation.inverseRelation!.joinColumns.map((joinColumn) => ({
          leftHand: `${joinAlias}.${joinColumn.propertyName}`,
          rightHand: `${mainAlias}.${joinColumn.referencedColumn!.propertyName}`
        }))
      }
    ];

    const fromPrimaryKeys = relation.inverseEntityMetadata.primaryColumns.map((pk) => ({
      selectPath: `${mainAlias}.${pk.propertyName}`,
      databasePath: pk.databasePath,
      propertyName: pk.propertyName
    }));

    return {
      relation,
      from: relation.type as Class<Relation>,
      fromAlias: mainAlias,
      fromPrimaryKeys,
      joins,

      mapRelations: <RawRelation>(entity: Entity, relations: Relation[], rawRelations: RawRelation[]): Relation[] => {
        const rawFilter = relation.inverseRelation!.inverseJoinColumns.reduce((columns, column) => ({
          ...columns,

          [`${joinAlias}_${column.propertyName}`]: column.referencedColumn.getEntityValue(entity)
        }), {} as Partial<Entity>);

        // First filter the raw relations with the PK of the entity, then filter the relations
        // with the PK of the raw relation
        return lodashFilter(rawRelations, rawFilter).reduce((entityRelations, rawRelation) => {
          const filter = relation.inverseRelation.joinColumns.reduce((columns, column) => ({
            ...columns,

            [column.referencedColumn.propertyName]: rawRelation[`${joinAlias}_${column.propertyName}`]
          }), {} as Partial<Entity>);

          return entityRelations.concat(lodashFilter(relations, filter) as any);
        }, [] as Relation[]);
      },

      batchSelect: (qb, entities: Entity[]) => {
        const params = {};
        const andSelect = [];

        const sql = relation.inverseRelation!.inverseJoinColumns.map((column) => {
          const paramName = this.getParamName(column.propertyName);
          params[paramName] = entities.map((entity) => column.referencedColumn!.getEntityValue(entity));

          // We also want to select the field, so we can map them back in the mapper
          andSelect.push(`${joinAlias}.${column.propertyName} AS ${joinAlias}_${column.propertyName}`);
          return `${joinAlias}.${column.propertyName} IN (:...${paramName})`;
        }).join(' AND ');

        // Add the needed joins
        return joins.reduce((qb, join) => {
          const conditions = join.conditions.map(({ leftHand, rightHand }) => `${leftHand} = ${rightHand}`);

          return qb.innerJoin(join.target, join.alias, conditions.join(' AND '));
        }, qb)
          .addSelect(andSelect)
          .andWhere(sql, params);
      },

      whereCondition: (entity: Entity): SQLFragment => {
        const params: ObjectLiteral = {};

        const sql = relation.inverseRelation!.inverseJoinColumns.map((inverseJoinColumn) => {
          const paramName = this.getParamName(inverseJoinColumn.propertyName);

          params[paramName] = inverseJoinColumn.referencedColumn!.getEntityValue(entity);

          return `${joinAlias}.${inverseJoinColumn.propertyName} = :${paramName}`;
        }).join(' AND ');

        return { sql, params };
      }
    };
  }

  private getParamName(prefix: string): string {
    this.paramCount += 1;
    return `${prefix}_${this.paramCount}`;
  }

  get entityIndexColName(): string {
    return '__nestjsQuery__entityIndex__';
  }

  private get escapedEntityIndexColName(): string {
    return this.escapeName(this.entityIndexColName);
  }

  private get unionAlias(): string {
    return 'unioned';
  }

  private escapeName(str: string): string {
    return this.relationRepo.manager.connection.driver.escape(str);
  }

  public getRelationPrimaryKeysPropertyNameAndColumnsName(): { columnName: string; propertyName: string }[] {
    return this.relationMeta.fromPrimaryKeys.map((pk) => ({
      propertyName: pk.propertyName,
      columnName: DriverUtils.buildAlias(
        this.relationRepo.manager.connection.driver,
        this.relationMeta.fromAlias,
        pk.databasePath
      )
    }));
  }
}
