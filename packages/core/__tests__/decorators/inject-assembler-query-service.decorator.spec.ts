import * as nestjsCommon from '@nestjs/common';
import { QueryService, InjectAssemblerQueryService, DefaultAssembler } from '../../src';
import { getAssemblerQueryServiceToken } from '../../src/decorators/helpers';

describe('@InjectAssemblerQueryService', () => {
  const injectSpy = jest.spyOn(nestjsCommon, 'Inject');

  class Foo {
    str!: string;
  }

  class Bar {
    num!: string;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  class TestAssembler extends DefaultAssembler<Foo, Bar> {}

  it('call inject with the correct key', () => {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {
      constructor(@InjectAssemblerQueryService(TestAssembler) readonly service: QueryService<Foo>) {}
    }
    expect(injectSpy).toHaveBeenCalledTimes(1);
    expect(injectSpy).toHaveBeenCalledWith(getAssemblerQueryServiceToken(TestAssembler));
  });
});
