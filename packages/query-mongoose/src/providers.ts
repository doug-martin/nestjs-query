import { FactoryProvider } from '@nestjs/common'
import { getModelToken, ModelDefinition } from '@nestjs/mongoose'
import { AssemblerDeserializer, AssemblerSerializer, Class, getQueryServiceToken } from '@ptc-org/nestjs-query-core'
import { Document, Model } from 'mongoose'

import { MongooseQueryService } from './services'

export type NestjsQueryModelDefinition<Entity extends Document> = {
  document: Class<Entity>
} & ModelDefinition

// initialize default serializer for documents, this is the type that mongoose returns from queries
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
AssemblerSerializer((obj: Document) => obj.toObject({ virtuals: true }))(Document)

function createMongooseQueryServiceProvider<Entity extends Document>(model: NestjsQueryModelDefinition<Entity>): FactoryProvider {
  return {
    provide: getQueryServiceToken(model.document),
    useFactory(ModelClass: Model<Entity>) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      AssemblerDeserializer<Entity>((obj: object) => new ModelClass(obj))(model.document)
      // eslint-disable-next-line @typescript-eslint/ban-types
      return new MongooseQueryService<Entity>(ModelClass)
    },
    inject: [getModelToken(model.name)]
  }
}

export const createMongooseQueryServiceProviders = (models: NestjsQueryModelDefinition<Document>[]): FactoryProvider[] =>
  models.map((model) => createMongooseQueryServiceProvider(model))
