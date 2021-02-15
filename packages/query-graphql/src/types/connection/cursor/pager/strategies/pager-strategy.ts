import { Query, SortField } from '@nestjs-query/core';
import { CursorPagingType } from '../../../../query';

export interface OffsetPagingOpts {
  offset: number;
  limit: number;
  isForward: boolean;
  isBackward: boolean;
  hasBefore: boolean;
}

export type KeySetField<DTO, K extends keyof DTO> = {
  field: K;
  value: DTO[K];
};

export type KeySetCursorPayload<DTO> = {
  type: 'keyset';
  fields: KeySetField<DTO, keyof DTO>[];
};

export interface KeySetPagingOpts<DTO> {
  payload?: KeySetCursorPayload<DTO>;
  limit: number;
  defaultSort: SortField<DTO>[];
  isForward: boolean;
  isBackward: boolean;
  hasBefore: boolean;
}

export type CursorPagingOpts<DTO> = OffsetPagingOpts | KeySetPagingOpts<DTO>;

export interface PagerStrategy<DTO> {
  toCursor(dto: DTO, index: number, opts: CursorPagingOpts<DTO>, query: Query<DTO>): string;
  fromCursorArgs(cursor: CursorPagingType): CursorPagingOpts<DTO>;
  isEmptyCursor(opts: CursorPagingOpts<DTO>): boolean;
  createQuery(query: Query<DTO>, opts: CursorPagingOpts<DTO>, includeExtraNode: boolean): Query<DTO>;
  checkForExtraNode(nodes: DTO[], opts: CursorPagingOpts<DTO>): DTO[];
}
