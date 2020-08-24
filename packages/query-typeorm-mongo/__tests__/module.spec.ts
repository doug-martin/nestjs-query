import { NestjsQueryTypeOrmMongoModule } from '../src';

describe('NestjsQueryTypeOrmMongoModule', () => {
  it('should create a module', () => {
    class TestEntity {}
    const typeOrmModule = NestjsQueryTypeOrmMongoModule.forFeature([TestEntity]);
    expect(typeOrmModule.imports).toHaveLength(1);
    expect(typeOrmModule.module).toBe(NestjsQueryTypeOrmMongoModule);
    expect(typeOrmModule.providers).toHaveLength(1);
    expect(typeOrmModule.exports).toHaveLength(2);
  });
});
