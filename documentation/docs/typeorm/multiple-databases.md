---
title: Multiple Databases
---

`TypeOrm` offers the possibility to connect your application to multiple databases or schemas. More details on this can be found on their [official documentation](https://typeorm.io/#/multiple-connections).

Further, the official `@nestjs/typeorm` package also provides functionality to support multiple databases within the application. For details, consider the [official documentation](https://docs.nestjs.com/techniques/database#multiple-databases).

Therefore, `@nestjs-query/query-typeorm` also offers this functionality. This section will walk you through a short example indicating how to connect your application to multiple databases. Further, this will assume, that you **already have a working application with a configured database**. Please note that only key aspects are shown here:

## Defining multiple connections

First you need to setup multiple database connections.

```ts
// app.module.ts

const musicEntities = [
  ArtistEntity,
  AlbumEntity,
  SongEntity,
  GenreEntity,
  // ...
];

const secretEntities = [SecretEntity];

export const MUSIC_DB_CONNECTION = 'default';
export const SECRET_DB_CONNECTION = 'secret';

@Module({
  imports: [
    ConfigModule.forRoot(environment),
    TypeOrmModule.forRoot({
      // name: MUSIC_DB_CONNECTION, // if you leave this out, this will be the "default" connection!
      type: "postgres",
      host: "localhost",
      port: 5436,
      username: 'user',
      password: 'password',
      database: 'music',
      synchronize: true,
      logging: true,
      entities: musicEntities,
    }),
    // this also works with the ASYNC configuration!
    TypeOrmModule.forRootAsync({
      name: SECRET_DB_CONNECTION,   // you need to set the name here!
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        ...configService.get('dbConnections.secret'),
        entities: secretEntities,
      }),
    }),
    GraphQLModule.forRootAsync({
      // ...
    }),
    // other modules
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

Of course, there can only be one `default` database connection. All other connections **must** have a proper `name` set up. Further, this name **must** be used when connecting against this specific entity.

## Create a new Feature Module

Second, you need to create a new module for the feature that should store its data in another database using the previously defined connection.

First, define your `Entity` class that is stored within the database

```ts
// app/modules/secret/secret.entity.ts
import { Entity, Column } from 'typeorm';

@Entity('secrets')
export class SecretEntity {
  // some properties here, like
  @Column()
  name: string;
}
```

and the corresponding `ObjectType` that is used for `GraphQL`

```ts
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('Secret')
export class SecretObject {
  @Field()
  name: string;
}
```

Next, you may want to create a custom `SecretDatabaseService` responsible for the database access. This is your specific [TypeOrmQueryService](./usage.md). Note that you now need to pass an additional argument to the `@InjectRepository()` decorator that indicates the `Connection` you are using. This string has to match the `name` property in the `TypeOrmModule` options!

```ts
import { QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecretEntity } from './entities/secret.entity';

@QueryService(SecretEntity)
export class SecretDatabaseService extends TypeOrmQueryService<SecretEntity> {
  constructor(
    @InjectRepository(SecretEntity, SECRET_DB_CONNECTION) repository: Repository<SecretEntity>,
  ) {
    super(repository);
  }
}
```

For the sake of brevity, the `AssemblerService` is not covered here, as it should not directly interact with the database itself. Therefore, no further adaptations are required. This also applies to the `Resolver`!

However, the `Module` that wires everything together, needs to be adapted accordingly. Again, you need to pass the name of the `Connection` when importing respective `TypeOrmModule`.

```ts
// app/modules/secret/secret.module.ts
import { Module } from '@nestjs/common';
import { SecretDatabaseService } from './services/secret-database.service';
import { SecretAssemblerService } from './services/secret-assembler.service';
import { SecretAssembler } from './secret.assembler';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { SecretEntity } from './secret.entity';

@Module({
  imports: [NestjsQueryTypeOrmModule.forFeature([SecretEntity], SECRET_DB_CONNECTION)],
  providers: [SecretAssembler, SecretDatabaseService, SecretAssemblerService],
})
export class SecretModule {}
```
