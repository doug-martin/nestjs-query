import { Class } from '@ptc-org/nestjs-query-core'

import { Hook } from './hooks'

export const createDefaultHook = <T>(func: Hook<T>['run']): Class<Hook<T>> => {
  class DefaultHook implements Hook<T> {
    get run() {
      return func
    }
  }

  return DefaultHook
}
