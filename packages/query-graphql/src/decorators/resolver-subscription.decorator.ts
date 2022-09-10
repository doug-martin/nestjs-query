import { applyDecorators } from '@nestjs/common'
import { ReturnTypeFunc, Subscription, SubscriptionOptions } from '@nestjs/graphql'

import { ResolverMethod, ResolverMethodOpts } from './resolver-method.decorator'

export interface SubscriptionResolverMethodOpts extends ResolverMethodOpts {
  enableSubscriptions?: boolean
}

export function areSubscriptionsEnabled(opts: SubscriptionResolverMethodOpts[]): boolean {
  return !!opts.find((o) => o.enableSubscriptions)
}

export function ResolverSubscription(
  typeFunc: ReturnTypeFunc,
  options?: SubscriptionOptions,
  ...opts: SubscriptionResolverMethodOpts[]
): MethodDecorator {
  if (!areSubscriptionsEnabled(opts)) {
    return (): void => {}
  }
  return applyDecorators(Subscription(typeFunc, options), ResolverMethod(...opts))
}
