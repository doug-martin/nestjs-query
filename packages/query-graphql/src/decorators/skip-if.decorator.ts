import { ComposableDecorator, ComposedDecorator, composeDecorators } from './decorator.utils'

/**
 * @internal
 * Wraps Args to allow skipping decorating
 * @param check - checker to run.
 * @param decorators - The decorators to apply
 */
export function SkipIf(check: () => boolean, ...decorators: ComposableDecorator[]): ComposedDecorator {
  if (check()) {
    return (): void => {}
  }
  return composeDecorators(...decorators)
}
