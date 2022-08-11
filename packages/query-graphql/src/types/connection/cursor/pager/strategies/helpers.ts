import { CursorPagingType } from '../../../../query'

export function isBackwardPaging(cursor: CursorPagingType): boolean {
  return typeof cursor.last !== 'undefined'
}

export function isForwardPaging(cursor: CursorPagingType): boolean {
  return !isBackwardPaging(cursor)
}

export function hasBeforeCursor(cursor: CursorPagingType): boolean {
  return isBackwardPaging(cursor) && !!cursor.before
}

export function encodeBase64(str: string): string {
  return Buffer.from(str, 'utf8').toString('base64')
}

export function decodeBase64(str: string): string {
  return Buffer.from(str, 'base64').toString('utf8')
}
