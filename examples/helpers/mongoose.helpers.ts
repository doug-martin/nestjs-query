import { MongooseModuleOptions } from '@nestjs/mongoose';

export const mongooseConfig = (db: string, overrides?: Partial<MongooseModuleOptions>): MongooseModuleOptions => {
  return {
    uri: `mongodb://localhost/${db}`,
    useNewUrlParser: true,
    ...overrides,
  };
};
