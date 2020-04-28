import { Model } from 'sequelize-typescript';
import { NestjsQuerySequelizeModule } from '../src';

describe('NestjsQueryTypeOrmModule', () => {
  it('should create a module', () => {
    class TestEntity extends Model<TestEntity> {}
    const module = NestjsQuerySequelizeModule.forFeature([TestEntity]);
    expect(module.imports).toHaveLength(1);
    expect(module.module).toBe(NestjsQuerySequelizeModule);
    expect(module.providers).toHaveLength(1);
    expect(module.exports).toHaveLength(2);
  });
});
