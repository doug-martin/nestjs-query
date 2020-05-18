import { getQueryServiceToken } from '@nestjs-query/core';
import { getModelToken } from '@nestjs/sequelize';
import { Model, Sequelize, Table, Column } from 'sequelize-typescript';
import { createSequelizeQueryServiceProviders } from '../src/providers';
import { SequelizeQueryService } from '../src/services';

describe('createSequelizeQueryServiceProviders', () => {
  it('should create a provider for the entity', () => {
    @Table
    class TestEntity extends Model<TestEntity> {
      @Column
      foo!: string;
    }
    // eslint-disable-next-line no-new
    new Sequelize({
      dialect: 'sqlite',
      database: ':memory:',
      models: [TestEntity],
    });
    const providers = createSequelizeQueryServiceProviders([TestEntity]);
    expect(providers).toHaveLength(1);
    expect(providers[0].provide).toBe(getQueryServiceToken(TestEntity));
    expect(providers[0].inject).toEqual([getModelToken(TestEntity)]);
    expect(providers[0].useFactory(TestEntity)).toBeInstanceOf(SequelizeQueryService);
  });
});
