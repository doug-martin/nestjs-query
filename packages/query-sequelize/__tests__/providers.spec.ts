import { getQueryServiceToken } from '@nestjs-query/core';
import { getModelToken } from '@nestjs/sequelize';
import { Model, Sequelize, Table, Column } from 'sequelize-typescript';
import * as core from '@nestjs-query/core';
import { createSequelizeQueryServiceProviders } from '../src/providers';
import { SequelizeQueryService } from '../src/services';

describe('createSequelizeQueryServiceProviders', () => {
  const assemblerDeserializerSpy = jest.spyOn(core, 'AssemblerDeserializer');
  const assemblerSerializerSpy = jest.spyOn(core, 'AssemblerSerializer');
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
    expect(assemblerDeserializerSpy).toBeCalledTimes(1);
    // @ts-ignore
    expect(assemblerDeserializerSpy.mock.calls[0][0]({ foo: 'bar' })).toEqual(TestEntity.build({ foo: 'bar' }));
    expect(assemblerSerializerSpy).toBeCalledTimes(1);
    expect(assemblerSerializerSpy.mock.calls[0][0](TestEntity.build({ foo: 'bar' }))).toEqual({ id: null, foo: 'bar' });
  });
});
