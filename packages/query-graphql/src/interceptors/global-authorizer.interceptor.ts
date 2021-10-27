import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GlobalAuthorizer } from '../auth/global.authorizer';

export type AuthorizerContext = { authorizer: GlobalAuthorizer };

@Injectable()
export class GlobalAuthorizerInterceptor implements NestInterceptor {
  constructor(private readonly authorizer: GlobalAuthorizer) {}

  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<AuthorizerContext>();
    ctx.authorizer = this.authorizer;
    return next.handle();
  }
}
