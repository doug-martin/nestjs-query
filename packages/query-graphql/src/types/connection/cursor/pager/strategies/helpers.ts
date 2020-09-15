import { CursorPagingType } from '../../../../query';

export function isBackwardPaging(cursor: CursorPagingType): boolean {
  return typeof cursor.last !== 'undefined';
}

export function isForwardPaging(cursor: CursorPagingType): boolean {
  return !isBackwardPaging(cursor);
}

export function hasBeforeCursor(cursor: CursorPagingType): boolean {
  return isBackwardPaging(cursor) && !!cursor.before;
}
