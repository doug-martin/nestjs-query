import { Provider } from '@nestjs/common'
import { Class } from '@ptc-org/nestjs-query-core'

import { getHookForType } from '../decorators'
import { getHookToken, HookTypes } from '../hooks'
import { PagingStrategies } from '../types'
import { CRUDAutoResolverOpts } from './resolver.provider'

export type HookProviderOptions<DTO, C, U> = Pick<
  CRUDAutoResolverOpts<DTO, C, U, unknown, PagingStrategies>,
  'DTOClass' | 'CreateDTOClass' | 'UpdateDTOClass'
>

function createHookProvider(hookType: HookTypes, ...DTOClass: Class<unknown>[]): Provider | undefined {
  return DTOClass.reduce((p: Provider | undefined, cls) => {
    if (p) {
      return p
    }
    const maybeHook = getHookForType(hookType, cls)
    if (maybeHook) {
      return { provide: getHookToken(hookType, cls), useClass: maybeHook }
    }
    return undefined
  }, undefined)
}

function getHookProviders(opts: HookProviderOptions<unknown, unknown, unknown>): Provider[] {
  const { DTOClass, CreateDTOClass = DTOClass, UpdateDTOClass = DTOClass } = opts
  return [
    createHookProvider(HookTypes.BEFORE_CREATE_ONE, CreateDTOClass, DTOClass),
    createHookProvider(HookTypes.BEFORE_CREATE_MANY, CreateDTOClass, DTOClass),
    createHookProvider(HookTypes.BEFORE_UPDATE_ONE, UpdateDTOClass, DTOClass),
    createHookProvider(HookTypes.BEFORE_UPDATE_MANY, UpdateDTOClass, DTOClass),
    createHookProvider(HookTypes.BEFORE_DELETE_ONE, DTOClass),
    createHookProvider(HookTypes.BEFORE_DELETE_MANY, DTOClass),
    createHookProvider(HookTypes.BEFORE_QUERY_MANY, DTOClass),
    createHookProvider(HookTypes.BEFORE_FIND_ONE, DTOClass)
  ].filter((p) => !!p)
}

export const createHookProviders = (opts: HookProviderOptions<unknown, unknown, unknown>[]): Provider[] =>
  opts.reduce((ps: Provider[], opt) => [...ps, ...getHookProviders(opt)], [])
