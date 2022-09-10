import { v4 } from 'uuid'

const replacer = /-/g

export function randomString(): string {
  return v4().replace(replacer, '')
}
