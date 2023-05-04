/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AggregateQuery, Class, Query } from '@codeshine/nestjs-query-core';
import { Repository, SelectQueryBuilder, ObjectLiteral, Brackets } from 'typeorm';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { DriverUtils } from 'typeorm/driver/DriverUtils';
import { FilterQueryBuilder } from './filter-query.builder';
import { AggregateBuilder } from './aggregate.builder';

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
  from: Class<Relation>;
  fromAlias: string;
  fromPrimaryKeys: PrimaryKey[];
  joins: JoinColumn[];
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
export class RelationQueryBuilder<Entity extends ObjectLiteral, Relation extends ObjectLiteral> {
  private relationMetadata: RelationQuery<Relation, Entity> | undefined;

  readonly filterQueryBuilder: FilterQueryBuilder<Relation>;

  readonly relationRepo: Repository<Relation>;

  private paramCount: number;

  constructor(readonly repo: Repository<Entity>, readonly relation: string) {
    this.relationRepo = this.repo.manager.getRepository<Relation>(this.relationMeta.from);
    this.filterQueryBuilder = new FilterQueryBuilder<Relation>(this.relationRepo);
    this.paramCount = 0;
  }

  select(entity: Entity, query: Query<Relation>): SelectQueryBuilder<Relation> {
    const hasRelations = this.filterQueryBuilder.filterHasRelations(query.filter);
    let relationBuilder = this.createRelationQueryBuilder(entity);
    relationBuilder = hasRelations
      ? this.filterQueryBuilder.applyRelationJoinsRecursive(
          relationBuilder,
          this.filterQueryBuilder.getReferencedRelationsRecursive(this.relationRepo.metadata, query.filter),
        )
      : relationBuilder;
    relationBuilder = this.filterQueryBuilder.applyFilter(relationBuilder, query.filter, relationBuilder.alias);
    relationBuilder = this.filterQueryBuilder.applyPaging(relationBuilder, query.paging);
    return this.filterQueryBuilder.applySorting(relationBuilder, query.sorting, relationBuilder.alias);
  }

  batchSelect(entities: Entity[], query: Query<Relation>): SelectQueryBuilder<EntityIndexRelation<Relation>> {
    const meta = this.relationMeta;
    const unionFragment = this.createUnionSelectSubQuery(entities, query);
    const unionedBuilder = this.relationRepo
      .createQueryBuilder(meta.fromAlias)
      .addSelect(`${this.escapedUnionAlias}.${this.escapedEntityIndexColName}`, this.entityIndexColName)
      .innerJoin(`(${unionFragment.sql})`, this.unionAlias, unionFragment.joinCondition, unionFragment.params);
    return this.filterQueryBuilder.applySorting(
      unionedBuilder.addOrderBy(`${this.escapedUnionAlias}.${this.escapedEntityIndexColName}`, 'ASC'),
      query.sorting,
      unionedBuilder.alias,
    ) as SelectQueryBuilder<EntityIndexRelation<Relation>>;
  }

  batchAggregate(
    entities: Entity[],
    query: Query<Relation>,
    aggregateQuery: AggregateQuery<Relation>,
  ): SelectQueryBuilder<EntityIndexRelation<Record<string, unknown>>> {
    const selects = [...AggregateBuilder.getAggregateSelects(aggregateQuery), this.entityIndexColName].map((c) =>
      this.escapeName(c),
    );
    const unionFragment = this.createUnionAggregateSubQuery(entities, query, aggregateQuery);
    return this.relationRepo.manager.connection
      .createQueryBuilder()
      .select(selects)
      .from<EntityIndexRelation<Record<string, unknown>>>(`(${unionFragment.sql})`, this.unionAlias)
      .setParameters(unionFragment.params);
  }

  aggregate(
    entity: Entity,
    query: Query<Relation>,
    aggregateQuery: AggregateQuery<Relation>,
  ): SelectQueryBuilder<Relation> {
    let relationBuilder = this.createRelationQueryBuilder(entity);
    relationBuilder = this.filterQueryBuilder.applyAggregate(relationBuilder, aggregateQuery, relationBuilder.alias);
    relationBuilder = this.filterQueryBuilder.applyFilter(relationBuilder, query.filter, relationBuilder.alias);
    relationBuilder = this.filterQueryBuilder.applyAggregateSorting(
      relationBuilder,
      aggregateQuery.groupBy,
      relationBuilder.alias,
    );
    relationBuilder = this.filterQueryBuilder.applyGroupBy(
      relationBuilder,
      aggregateQuery.groupBy,
      relationBuilder.alias,
    );
    return relationBuilder;
  }

  private createUnionAggregateSubQuery(
    entities: Entity[],
    query: Query<Relation>,
    aggregateQuery: AggregateQuery<Relation>,
  ): UnionSQLFragment {
    const { fromAlias } = this.relationMeta;
    const subQueries = entities.map((e, index) => {
      const subQuery = this.aggregate(e, query, aggregateQuery);
      return subQuery.addSelect(`${index}`, this.entityIndexColName);
    });
    const unionSqls = subQueries.reduce(
      ({ unions, parameters }: UnionQueries, sq) => ({
        unions: [...unions, sq.getQuery()],
        parameters: { ...parameters, ...sq.getParameters() },
      }),
      { unions: [], parameters: {} },
    );

    const unionSql = unionSqls.unions
      .map((u) => `SELECT * FROM (${u}) AS ${this.escapeName(fromAlias)}`)
      .join(' UNION ALL ');
    return { sql: unionSql, params: unionSqls.parameters };
  }

  private createUnionSelectSubQuery(entities: Entity[], query: Query<Relation>): UnionSQLFragment {
    const { fromPrimaryKeys, fromAlias } = this.relationMeta;
    const subQueries = entities.map((e, index) => {
      const subQuery = this.select(e, query);
      return subQuery
        .select(fromPrimaryKeys.map((fpk) => fpk.selectPath))
        .addSelect(`${index}`, this.entityIndexColName);
    });
    const unionSqls = subQueries.reduce(
      ({ unions, parameters }: UnionQueries, sq) => ({
        unions: [...unions, sq.getQuery()],
        parameters: { ...parameters, ...sq.getParameters() },
      }),
      { unions: [], parameters: {} },
    );

    const unionSql = unionSqls.unions
      .map((u) => `SELECT * FROM (${u}) AS ${this.escapeName(fromAlias)}`)
      .join(' UNION ALL ');
    const joinCondition = fromPrimaryKeys
      .map(
        (fpk) => `${fpk.selectPath} = ${this.escapedUnionAlias}.${this.escapeName(`${fromAlias}_${fpk.databasePath}`)}`,
      )
      .join(' AND ');
    return { sql: unionSql, params: unionSqls.parameters, joinCondition };
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
    const fromPrimaryKeys = relation.inverseEntityMetadata.primaryColumns.map((pk) => ({
      selectPath: `${relation.propertyName}.${pk.propertyName}`,
      databasePath: pk.databasePath,
      propertyName: pk.propertyName,
    }));
    return {
      from: relation.type as Class<Relation>,
      fromAlias: relation.propertyName,
      fromPrimaryKeys,
      joins,
      whereCondition: (entity: Entity): SQLFragment => {
        const params: ObjectLiteral = {};
        const sql = primaryColumns
          .map((column) => {
            const paramName = this.getParamName(aliasName);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
    const fromPrimaryKeys: PrimaryKey[] = relation.inverseEntityMetadata.primaryColumns.map((pk) => ({
      selectPath: `${aliasName}.${pk.propertyName}`,
      databasePath: pk.databasePath,
      propertyName: pk.propertyName,
    }));
    return {
      from: relation.inverseRelation!.entityMetadata.target as Class<Relation>,
      fromAlias: aliasName,
      fromPrimaryKeys,
      joins: [],
      whereCondition: (entity: Entity): SQLFragment => {
        const params: ObjectLiteral = {};
        const sql = columns
          .map((col) => {
            const paramName = this.getParamName(aliasName);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
    const fromPrimaryKeys = relation.inverseEntityMetadata.primaryColumns.map((pk) => ({
      selectPath: `${mainAlias}.${pk.propertyName}`,
      databasePath: pk.databasePath,
      propertyName: pk.propertyName,
    }));
    return {
      from: relation.type as Class<Relation>,
      fromAlias: mainAlias,
      fromPrimaryKeys,
      joins,
      whereCondition: (entity: Entity): SQLFragment => {
        const params: ObjectLiteral = {};
        const sql = relation.joinColumns
          .map((joinColumn) => {
            const paramName = this.getParamName(joinColumn.propertyName);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
    const fromPrimaryKeys = relation.inverseEntityMetadata.primaryColumns.map((pk) => ({
      selectPath: `${mainAlias}.${pk.propertyName}`,
      databasePath: pk.databasePath,
      propertyName: pk.propertyName,
    }));
    return {
      from: relation.type as Class<Relation>,
      fromAlias: mainAlias,
      fromPrimaryKeys,
      joins,
      whereCondition: (entity: Entity): SQLFragment => {
        const params: ObjectLiteral = {};
        const sql = relation
          .inverseRelation!.inverseJoinColumns.map((inverseJoinColumn) => {
            const paramName = this.getParamName(inverseJoinColumn.propertyName);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            params[paramName] = inverseJoinColumn.referencedColumn!.getEntityValue(entity);
            return `${joinAlias}.${inverseJoinColumn.propertyName} = :${paramName}`;
          })
          .join(' AND ');
        return { sql, params };
      },
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

  private get escapedUnionAlias() {
    return this.escapeName(this.unionAlias);
  }

  private escapeName(str: string): string {
    return this.relationRepo.manager.connection.driver.escape(str);
  }

  getRelationPrimaryKeysPropertyNameAndColumnsName(): { columnName: string; propertyName: string }[] {
    return this.relationMeta.fromPrimaryKeys.map((pk) => ({
      propertyName: pk.propertyName,
      columnName: DriverUtils.buildColumnAlias(
        this.relationRepo.manager.connection.driver,
        this.relationMeta.fromAlias,
        pk.databasePath,
      ),
    }));
  }
}
