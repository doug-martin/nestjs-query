import { Module } from '@nestjs/common'
import { GraphQLFederationModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'

import { typeormOrmConfig } from '../../../helpers'
import { TagModule } from './tag/tag.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormOrmConfig('federation_tag')),
    GraphQLFederationModule.forRoot({
      autoSchemaFile: 'schema.gql'
    }),
    TagModule
  ]
})
export class AppModule {}
