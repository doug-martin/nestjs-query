import { NoOpQueryService, QueryService } from '@nestjs-query/core';
import { TestResolverDTO } from './test-resolver.dto';

@QueryService(TestResolverDTO)
export class TestService extends NoOpQueryService<TestResolverDTO> {
  [x: string]: any;
}
