import { Filter } from '@nestjs-query/core';
import { CRUDAuthService, AuthorizationService } from '../../../src';
import { TestResolverDTO } from './test-resolver.dto';

@AuthorizationService(TestResolverDTO)
export class TestResolverAuthService implements CRUDAuthService<TestResolverDTO> {
  authFilter(context: any): Promise<Filter<TestResolverDTO>> {
    return Promise.reject(new Error('authFilter Not Implemented'));
  }

  relationAuthFilter<Relation>(relationName: string, context: any): Promise<Filter<Relation>> {
    return Promise.reject(new Error('relationAuthFilter Not Implemented'));
  }
}
