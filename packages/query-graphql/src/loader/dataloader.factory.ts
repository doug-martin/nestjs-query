import { ExecutionContext } from '@nestjs/common'
import Dataloader from 'dataloader'

const cacheKeyFn = <K>(key: K): string =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  JSON.stringify(key, (_, v) => (typeof v === 'bigint' ? v.toString() : v))

export interface NestjsQueryExecutionContext extends ExecutionContext {
  nestjsQueryLoaders?: Record<string, Dataloader<unknown, unknown>>
}

export class DataLoaderFactory {
  private static initializeContext(context: NestjsQueryExecutionContext): Record<string, Dataloader<unknown, unknown>> {
    if (!context.nestjsQueryLoaders) {
      // eslint-disable-next-line no-param-reassign
      context.nestjsQueryLoaders = {}
    }
    return context.nestjsQueryLoaders
  }

  static getOrCreateLoader<K, V>(
    context: NestjsQueryExecutionContext,
    name: string,
    handler: Dataloader.BatchLoadFn<K, V>
  ): Dataloader<K, V> {
    const nestjsQueryLoaders = this.initializeContext(context)
    if (!nestjsQueryLoaders[name]) {
      // eslint-disable-next-line no-param-reassign
      nestjsQueryLoaders[name] = new Dataloader(handler, { cacheKeyFn })
    }
    return nestjsQueryLoaders[name] as Dataloader<K, V>
  }
}
