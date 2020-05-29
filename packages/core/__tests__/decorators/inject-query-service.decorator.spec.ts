import { Test } from '@nestjs/testing';
import { Injectable } from '@nestjs/common';
import { QueryService, InjectQueryService, getQueryServiceToken, NoOpQueryService } from '../../src';

describe('@InjectQueryService', () => {
  class TestEntity {}

  it('call inject with the correct key', async () => {
    @Injectable()
    class TestService {
      constructor(@InjectQueryService(TestEntity) readonly service: QueryService<TestEntity>) {}
    }
    const noopQueryService = new NoOpQueryService<TestEntity>();
    const moduleRef = await Test.createTestingModule({
      providers: [
        TestService,
        {
          provide: getQueryServiceToken(TestEntity),
          useValue: noopQueryService,
        },
      ],
    }).compile();
    const testService = moduleRef.get(TestService);
    expect(testService).toBeInstanceOf(TestService);
    expect(testService.service).toBe(noopQueryService);
  });
});
