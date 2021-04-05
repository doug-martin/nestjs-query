import { Authorizer, AuthorizationContext } from '@nestjs-query/query-graphql';
import { Filter } from '@nestjs-query/core';
import { UserContext } from '../auth/auth.interfaces';
import { SubTaskDTO } from './dto/sub-task.dto';

export class SubTaskAuthorizer implements Authorizer<SubTaskDTO> {
  authorize(context: UserContext, authorizationContext?: AuthorizationContext): Promise<Filter<SubTaskDTO>> {
    const operationName = authorizationContext?.operationName;
    if (
      context.req.user.username === 'nestjs-query-3' &&
      (operationName?.startsWith('query') ||
        operationName?.startsWith('find') ||
        operationName?.startsWith('aggregate'))
    ) {
      return Promise.resolve({});
    }
    return Promise.resolve({ ownerId: { eq: context.req.user.id } });
  }

  authorizeRelation(relationName: string, context: UserContext): Promise<Filter<unknown>> {
    if (relationName === 'todoItem') {
      return Promise.resolve({ ownerId: { eq: context.req.user.id } });
    }
    return Promise.resolve({});
  }
}
