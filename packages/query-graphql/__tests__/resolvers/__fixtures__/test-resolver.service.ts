import { NoOpQueryService, QueryService } from '@nestjs-query/core';
import { TestResolverDTO } from './test-resolver.dto';

@QueryService(TestResolverDTO)
export class TestService extends NoOpQueryService<TestResolverDTO> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
}
