---
title: Assemblers
---

Assemblers are used to translate your DTO into the underlying database type and back.

## When to use Assemblers

In most cases an Assembler will not be required because your Entity and DTO will be the same shape.

The only time you need to define an assembler is when the DTO and Entity are different. The most common scenarios are

* Additional computed fields and you do not want to include the business logic in your DTO definition.
* Different field names because of poorly named columns in the database or to make a DB change passive to the end user.

## ClassTransformerAssembler

In most cases the [class-transformer](https://github.com/typestack/class-transformer) package will properly map back and forth. Because of this there is a `ClassTransformerAssembler` that leverages the `plainToClass` method.

**NOTE** The `ClassTransformerAssembler` is the default implementation if an `Assembler` is not manually defined.

If you find yourself in a scenario where you need to compute values and you dont want to add the business logic to your DTO you can extend the `ClassTransformerAssembler`.

Lets take a simple example, where we have `TodoItemDTO` and we want to compute the `age`.

```ts
import { Assembler, ClassTransformerAssembler } from '@nestjs-query/core';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TodoItemEntity } from './todo-item.entity';

// `@Assembler` decorator will register the assembler with `nestjs-query` and
// the QueryService service will be able to auto discover it.
@Assembler(TodoItemDTO, TodoItemEntity)
export class TodoItemAssembler extends ClassTransformerAssembler<TodoItemDTO, TodoItemEntity> {
  convertToDTO(entity: TodoItemEntity): TodoItemDTO {
    const dto = super.convertToDTO(entity);
    // compute the age
    dto.age = Date.now() - entity.created.getMilliseconds();
    return dto;
  }
}
```

While this example is fairly trivial, the same pattern should apply for more complex scenarios.

## AbstractAssembler

To create your own `Assembler` extend the `AbstractAssembler`.

Lets assume we have the following `UserDTO`.

```ts
import { FilterableField } from '@nestjs-query/query-graphql';
import { ObjectType } from 'type-graphql';

@ObjectType('User')
class UserDTO {
  @FilterableField()
  firstName!: string;

  @FilterableField()
  lastName!: string;

  @FilterableField()
  emailAddress!: string;
}

```

But you inherited a DB schema that has names that are not as user friendly.

```ts
import {Entity, Column} from 'typeorm'

@Entity()
class UserEntity {
  @Column()
  first!: string;

  @Column()
  last!: string;

  @Column()
  email!: string;
}
```

To properly translate the `UserDTO` into the `UserEntity` and back you can extend an `Assembler` that the `QueryService` will use.

```ts
import { AbstractAssembler, Assembler, Query, transformQuery } from '@nestjs-query/core';
import { UserDTO } from './dto/user.dto';
import { UserEntity } from './user.entity';

// `@Assembler` decorator will register the assembler with `nestjs-query` and
// the QueryService service will be able to auto discover it.
@Assembler(UserDTO, UserEntity)
export class UserAssembler extends AbstractAssembler<UserDTO, UserEntity> {
  convertQuery(query: Query<UserDTO>): Query<UserEntity> {
    return transformQuery(query, {
      firstName: 'first',
      lastName: 'last',
      emailAddress: 'email',
    });
  }

  convertToDTO(entity: UserEntity): UserDTO {
    const dto = new UserDTO();
    dto.firstName = entity.first;
    dto.lastName = entity.last;
    return dto;
  }

  convertToEntity(dto: UserDTO): UserEntity {
    const entity = new UserEntity();
    entity.first = dto.firstName;
    entity.last = dto.lastName;
    return entity;
  }
}

```

The first thing to look at is the `@Assembler` decorator. It will register the assembler with `nestjs-query` so `QueryServices` can look it up later.  

```ts
@Assembler(UserDTO, UserEntity)
```

### Converting the Query

Next the `convertQuery` method.

```ts
convertQuery(query: Query<UserDTO>): Query<UserEntity> {
  return transformQuery(query, {
    firstName: 'first',
    lastName: 'last',
    emailAddress: 'email',
  });
}
```

This method leverages the `transformQuery` function from `@nestjs-query/core`. This method will remap all fields specified in the field map to correct field name.

In this example

```ts
{
  filter: {
    firstName: { eq: 'Bob' },
    lastName: { eq: 'Yukon' },
    emailAddress: { eq: 'bob@yukon.com' }
  }
}
```

Would be transformed into.

```ts
{
  filter: {
    first: { eq: 'Bob' },
    last: { eq: 'Yukon' },
    email: { eq: 'bob@yukon.com' }
  }
}
```

### Converting the DTO

The next piece is the `convertToDTO`, which will convert the entity into a the correct DTO.

```ts
convertToDTO(entity: UserEntity): UserDTO {
  const dto = new UserDTO();
  dto.firstName = entity.first;
  dto.lastName = entity.last;
  return dto;
}
```

### Converting the Entity

The next piece is the `convertToEntity`, which will convert the DTO into a the correct entity.

```ts
convertToEntity(dto: UserDTO): UserEntity {
  const entity = new UserEntity();
  entity.first = dto.firstName;
  entity.last = dto.lastName;
  return entity;
}
```

This is a pretty basic example but the same pattern should apply to more complex scenarios.

## AssemblerQueryService

To use your assembler you need to create an `AssemblerQueryService` that will wrap a `QueryService` to translate back and forth.

This example wraps a `TypeOrmQueryService` to assemble to `UserDTO` and `UserEntity`

```ts
import { AssemblerQueryService, QueryService } from '@nestjs-query/core';
import { InjectTypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { UserDTO } from './user.dto';
import { UserAssembler } from './user.assembler';
import { UserEntity } from './user.entity';

@QueryService(UserDTO)
export class UserService extends AssemblerQueryService<UserDTO, UserEntity> {
  constructor(
    assembler: UserAssembler,
    @InjectTypeOrmQueryService(UserEntity) queryService: QueryService<UserEntity>,
  ) {
    super(assembler, queryService);
  }
}
```

Your resolver should then use the `UserService` to fetch records.

```ts
import { CRUDResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { UserDTO } from './user.dto';
import { UserService } from './user.service';

@Resolver(() => UserDTO)
export class UserResolver extends CRUDResolver(UserDTO) {
  constructor(readonly service: UserService) {
    super(service);
  }
}
```

## Registering Your Assembler

Don't forget to register your `Assembler` and `QueryService` with your module.

```ts
@Module({
  providers: [/*Other providers*/, UserAssembler, UserService],
  // ...other module options
})
export class UserModule {}
```
