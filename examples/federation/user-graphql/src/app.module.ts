import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { typeormOrmConfig } from '../../../helpers';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('federation_user')),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: true,
    }),
    UserModule,
  ],
})
export class AppModule {}
