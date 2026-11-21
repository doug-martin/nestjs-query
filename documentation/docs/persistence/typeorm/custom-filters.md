---
title: Custom Filters
---

In addition to the built in filters, which work for a lot of common scenarios, @nestjs-query/typeorm supports custom filters.

There are 2 types of custom filters:
- Global type-based filters, that automatically work on all fields of a given database type.
- Custom entity-specific filters, that are custom-tailored for entities and do not require a backing database field (more on that below).

[//]: # (TODO Add link to page)
:::important
This page describes how to implement custom filters. In order to expose them in Graphql see the [relevant page](/docs/graphql/custom-filters)!
:::

## Global custom filters

Let's assume we want to create a filter that allows us to filter for integer fields where the value is a multiple of a given number. The custom filter would look like this

```ts title="is-multiple-of.filter.ts"
import { TypeOrmQueryFilter, CustomFilter, CustomFilterResult } from '@nestjs-query/query-typeorm';

@TypeOrmQueryFilter({
  types: [Number, 'integer'],
  operations: ['isMultipleOf'],
})
export class IsMultipleOfCustomFilter implements CustomFilter {
  apply(field: string, cmp: string, val: unknown, alias?: string): CustomFilterResult {
    alias = alias ? alias : '';
    const pname = `param${randomString()}`;
    return {
      sql: `(${alias}.${field} % :${pname}) == 0`,
      params: { [pname]: val },
    };
  }
}
```

Then, you need to register the filter in your NestjsQueryTypeOrmModule definition

```ts
NestjsQueryTypeOrmModule.forFeature(
  [], // Entities
  undefined, // Connection, undefined means "use the default one"
  {
    providers: [
      IsMultipleOfCustomFilter,
    ],
  },
);
```

That's it! Now the filter will be automatically used whenever a filter like `{<propertyName>: {isMultipleOf: <number>}}` is passed!

## Entity custom filters

Let's assume that we have a Project entity and a Task entity, where Project has many tasks and where tasks can be either complete or not. We want to create a filter on Project that returns only projects with X pending tasks.

Our entities look like this:

```ts
@Entity()
// Note how the custom filter is registered here
@WithTypeormQueryFilter<TestEntity>({
  filter: TestEntityTestRelationCountFilter,
  fields: ['pendingTasks'],
  operations: ['gt'],
})
export class Project {
  @PrimaryColumn({ name: 'id' })
  id!: string;

  @OneToMany('TestRelation', 'testEntity')
  tasks?: Task[];
}

@Entity()
export class Task {
  @PrimaryColumn({ name: 'id' })
  id!: string;

  @Column({ name: 'status' })
  status!: string;

  @ManyToOne(() => TestEntity, (te) => te.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project?: Project;

  @Column({ name: 'project_id', nullable: true })
  projectId?: string;
}
```

The custom filter, instead, looks like this:

```ts title="project-pending-tasks-count.filter.ts"
import { TypeOrmQueryFilter, CustomFilter, CustomFilterResult } from '@nestjs-query/query-typeorm';
import { EntityManager } from 'typeorm';

// No operations or types here, which means that the filter is not registered globally on types. We will be registering the filter individually on the Project entity.
@TypeOrmQueryFilter()
export class TestEntityTestRelationCountFilter implements CustomFilter {
  // Since the filter is an Injectable, we can inject other services here, such as an entity manager to create the subquery
  constructor(private em: EntityManager) {}

  apply(field: string, cmp: string, val: unknown, alias?: string): CustomFilterResult {
    alias = alias ? alias : '';
    const pname = `param${randomString()}`;

    const subQb = this.em
      .createQueryBuilder(Task, 't')
      .select('COUNT(*)')
      .where(`t.status = 'pending' AND t.project_id = ${alias}.id`);

    return {
      sql: `(${subQb.getSql()}) > :${pname}`,
      params: { [pname]: val },
    };
  }
}
```

That's it! Now the filter will be automatically used whenever a filter like `{pendingTasks: {gt: <number>}}` is used, but only when said filter refers to the Project entity.
