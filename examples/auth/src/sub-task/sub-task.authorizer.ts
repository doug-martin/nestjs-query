import { Authorizer } from '@nestjs-query/query-graphql';
import { Filter } from '@nestjs-query/core';
import { UserContext } from '../auth/auth.interfaces';
import { SubTaskDTO } from './dto/sub-task.dto';

export class SubTaskAuthorizer implements Authorizer<SubTaskDTO> {
  authorize(context: UserContext): Promise<Filter<SubTaskDTO>> {
    return Promise.resolve({ ownerId: { eq: context.req.user.id } });
  }

  authorizeRelation(relationName: string, context: UserContext): Promise<Filter<unknown>> {
    if (relationName === 'todoItem') {
      return Promise.resolve({ ownerId: { eq: context.req.user.id } });
    }
    return Promise.resolve({});
  }
}
