import { DynamicModule } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Document } from 'mongoose'

import { createMongooseQueryServiceProviders, NestjsQueryModelDefinition } from './providers'

export class NestjsQueryMongooseModule {
  static forFeature(models: NestjsQueryModelDefinition<Document>[], connectionName?: string): DynamicModule {
    const queryServiceProviders = createMongooseQueryServiceProviders(models)
    const mongooseModule = MongooseModule.forFeature(models, connectionName)
    return {
      imports: [mongooseModule],
      module: NestjsQueryMongooseModule,
      providers: [...queryServiceProviders],
      exports: [...queryServiceProviders, mongooseModule]
    }
  }
}
