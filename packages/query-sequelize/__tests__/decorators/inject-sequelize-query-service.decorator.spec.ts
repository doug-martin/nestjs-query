import { getQueryServiceToken, QueryService } from '@nestjs-query/core';
import * as nestjsCommon from '@nestjs/common';
import { Model } from 'sequelize-typescript';
import { InjectSequelizeQueryService } from '../../src';

describe('@InjectSequelizeQueryService', () => {
  const injectSpy = jest.spyOn(nestjsCommon, 'Inject');

  class TestEntity extends Model<TestEntity> {}

  it('call inject witht the correct key', () => {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {
      constructor(@InjectSequelizeQueryService(TestEntity) readonly service: QueryService<TestEntity>) {}
    }
    expect(injectSpy).toBeCalledTimes(1);
    expect(injectSpy).toBeCalledWith(getQueryServiceToken(TestEntity));
  });
});
