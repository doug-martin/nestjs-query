import { NestjsQueryMongooseModule } from '../src';
import { TestEntity, TestEntitySchema } from './__fixtures__';

describe('NestjsQueryTypegooseModule', () => {
  it('should create a module', () => {
    const typeOrmModule = NestjsQueryMongooseModule.forFeature([
      { document: TestEntity, name: TestEntity.name, schema: TestEntitySchema }
    ]);
    expect(typeOrmModule.imports).toHaveLength(1);
    expect(typeOrmModule.module).toBe(NestjsQueryMongooseModule);
    expect(typeOrmModule.providers).toHaveLength(1);
    expect(typeOrmModule.exports).toHaveLength(2);
  });
});
