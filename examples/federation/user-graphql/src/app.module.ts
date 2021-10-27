import { Module } from '@nestjs/common';
import { GraphQLFederationModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormOrmConfig } from '../../../helpers';
import { UserModule } from './user/user.module';
import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forRoot(),
    TypeOrmModule.forRoot(typeormOrmConfig('federation_user')),
    GraphQLFederationModule.forRoot({
      autoSchemaFile: 'schema.gql',
    }),
    UserModule,
  ],
})
export class AppModule {}
