import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Observable } from 'rxjs'

import { config } from './config'
import { AUTH_HEADER_NAME } from './constants'

export type GqlContext = { request: { headers: Record<string, string> } }

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name)

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const { headers } = GqlExecutionContext.create(context).getContext<GqlContext>().request
    this.logger.log(`Req = ${JSON.stringify(headers)}`)
    return headers[AUTH_HEADER_NAME] === config.auth.header
  }
}
