import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AUTH_HEADER_NAME } from './constants';
import { config } from './config';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().request;
    this.logger.log(`Req = ${req.headers}`);
    return req.headers[AUTH_HEADER_NAME] === config.auth.header;
  }
}
