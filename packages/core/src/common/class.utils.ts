import { Class } from './class.type';

export function getPrototypeChain(Cls: Class<unknown>): Class<unknown>[] {
  const baseClass = Object.getPrototypeOf(Cls) as Class<unknown>;
  if (baseClass) {
    return [Cls, ...getPrototypeChain(baseClass)];
  }
  return [Cls];
}
