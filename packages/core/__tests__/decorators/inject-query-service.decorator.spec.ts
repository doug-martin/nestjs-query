import * as nestjsCommon from '@nestjs/common';
import { QueryService, InjectQueryService, getQueryServiceToken } from '../../src';

describe('@InjectQueryService', () => {
  const injectSpy = jest.spyOn(nestjsCommon, 'Inject');

  class TestEntity {}

  it('call inject with the correct key', () => {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {
      constructor(@InjectQueryService(TestEntity) readonly service: QueryService<TestEntity>) {}
    }
    expect(injectSpy).toHaveBeenCalledTimes(1);
    expect(injectSpy).toHaveBeenCalledWith(getQueryServiceToken(TestEntity));
  });
});
