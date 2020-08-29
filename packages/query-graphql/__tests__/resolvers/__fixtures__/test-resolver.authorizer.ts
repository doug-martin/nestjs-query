import { Filter } from '@nestjs-query/core';
import { Injectable } from '@nestjs/common';
import { Authorizer } from '../../../src';
import { TestResolverDTO } from './test-resolver.dto';

@Injectable()
export class TestResolverAuthorizer implements Authorizer<TestResolverDTO> {
  authorize(context: any): Promise<Filter<TestResolverDTO>> {
    return Promise.reject(new Error('authorize Not Implemented'));
  }

  authorizeRelation<Relation>(relationName: string, context: any): Promise<Filter<Relation>> {
    return Promise.reject(new Error('authorizeRelation Not Implemented'));
  }
}
