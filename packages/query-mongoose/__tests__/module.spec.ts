import { NestjsQueryMongooseModule } from '../src';

describe('NestjsQueryTypegooseModule', () => {
  it('should create a module', () => {
    class TestEntity {}
    const typeOrmModule = NestjsQueryMongooseModule.forFeature([TestEntity]);
    expect(typeOrmModule.imports).toHaveLength(1);
    expect(typeOrmModule.module).toBe(NestjsQueryMongooseModule);
    expect(typeOrmModule.providers).toHaveLength(1);
    expect(typeOrmModule.exports).toHaveLength(2);
  });
});
