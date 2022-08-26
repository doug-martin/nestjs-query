import { Injectable } from '@nestjs/common'
import { Filter } from '@ptc-org/nestjs-query-core'
import { Authorizer } from '@ptc-org/nestjs-query-graphql'

import { TestResolverDTO } from './test-resolver.dto'

@Injectable()
export class TestResolverAuthorizer implements Authorizer<TestResolverDTO> {
  authorize(): Promise<Filter<TestResolverDTO>> {
    return Promise.reject(new Error('authorize Not Implemented'))
  }

  authorizeRelation<Relation>(): Promise<Filter<Relation>> {
    return Promise.reject(new Error('authorizeRelation Not Implemented'))
  }
}
