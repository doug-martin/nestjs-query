import { Module } from '@nestjs/common';
import { GraphQLFederationModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagModule } from './tag/tag.module';
import { typeormOrmConfig } from '../../../helpers';
import { resolve } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('federation_tag')),
    GraphQLFederationModule.forRoot({
      autoSchemaFile: resolve(__dirname, '..', 'schema.gql'),
    }),
    TagModule,
  ],
})
export class AppModule {}
