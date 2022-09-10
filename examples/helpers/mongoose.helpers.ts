import { MongooseModuleOptions } from '@nestjs/mongoose'

export const mongooseConfig = (db: string, overrides?: Partial<MongooseModuleOptions>): MongooseModuleOptions => ({
  uri: `mongodb://localhost/${db}`,
  useNewUrlParser: true,
  ...overrides
})
