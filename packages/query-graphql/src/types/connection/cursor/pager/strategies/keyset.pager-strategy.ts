import { Class, Filter, invertSort, mergeFilter, Query, SortDirection, SortField } from '@nestjs-query/core';
import { plainToClass } from 'class-transformer';
import { BadRequestException } from '@nestjs/common';
import { KeySetCursorPayload, KeySetPagingOpts, PagerStrategy } from './pager-strategy';
import { CursorPagingType } from '../../../../query';
import { decodeBase64, encodeBase64, hasBeforeCursor, isBackwardPaging, isForwardPaging } from './helpers';

export class KeysetPagerStrategy<DTO> implements PagerStrategy<DTO> {
  constructor(readonly DTOClass: Class<DTO>, readonly pageFields: (keyof DTO)[]) {}

  fromCursorArgs(cursor: CursorPagingType): KeySetPagingOpts<DTO> {
    const { defaultSort } = this;
    const isForward = isForwardPaging(cursor);
    const isBackward = isBackwardPaging(cursor);
    const hasBefore = hasBeforeCursor(cursor);
    let payload;
    let limit = 0;
    if (isForwardPaging(cursor)) {
      payload = cursor.after ? this.decodeCursor(cursor.after) : undefined;
      limit = cursor.first ?? 0;
    }
    if (isBackwardPaging(cursor)) {
      payload = cursor.before ? this.decodeCursor(cursor.before) : undefined;
      limit = cursor.last ?? 0;
    }
    return { payload, defaultSort, limit, isBackward, isForward, hasBefore };
  }

  toCursor(dto: DTO, index: number, opts: KeySetPagingOpts<DTO>, query: Query<DTO>): string {
    const cursorFields: (keyof DTO)[] = [
      ...(query.sorting ?? []).map((f: SortField<DTO>) => f.field),
      ...this.pageFields,
    ];
    return this.encodeCursor(this.createKeySetPayload(dto, cursorFields));
  }

  isEmptyCursor(opts: KeySetPagingOpts<DTO>): boolean {
    return !opts.payload || !opts.payload.fields.length;
  }

  createQuery<Q extends Query<DTO>>(query: Q, opts: KeySetPagingOpts<DTO>, includeExtraNode: boolean): Q {
    const paging = { limit: opts.limit };
    if (includeExtraNode) {
      // Add 1 to the limit so we will fetch an additional node
      paging.limit += 1;
    }
    const { payload } = opts;
    // Add 1 to the limit so we will fetch an additional node with the current node
    const sorting = this.getSortFields(query, opts);
    const filter = mergeFilter(query.filter ?? {}, this.createFieldsFilter(sorting, payload));
    return { ...query, filter, paging, sorting };
  }

  checkForExtraNode(nodes: DTO[], opts: KeySetPagingOpts<DTO>): DTO[] {
    const hasExtraNode = nodes.length > opts.limit;
    const returnNodes = [...nodes];
    if (hasExtraNode) {
      returnNodes.pop();
    }
    if (opts.isBackward) {
      returnNodes.reverse();
    }
    return returnNodes;
  }

  private get defaultSort(): SortField<DTO>[] {
    return this.pageFields.map((field) => ({ field, direction: SortDirection.ASC }));
  }

  private encodeCursor(fields: KeySetCursorPayload<DTO>): string {
    return encodeBase64(JSON.stringify(fields));
  }

  private decodeCursor(cursor: string): KeySetCursorPayload<DTO> {
    try {
      const payload = JSON.parse(decodeBase64(cursor)) as KeySetCursorPayload<DTO>;
      if (payload.type !== 'keyset') {
        throw new BadRequestException('Invalid cursor');
      }
      const partial: Partial<DTO> = payload.fields.reduce(
        (dtoPartial: Partial<DTO>, { field, value }) => ({ ...dtoPartial, [field]: value }),
        {},
      );
      const transformed = plainToClass(this.DTOClass, partial);
      const typesafeFields = payload.fields.map(({ field }) => ({ field, value: transformed[field] }));
      return { ...payload, fields: typesafeFields };
    } catch (e) {
      throw new BadRequestException('Invalid cursor');
    }
  }

  private createFieldsFilter(sortFields: SortField<DTO>[], payload: KeySetCursorPayload<DTO> | undefined): Filter<DTO> {
    if (!payload) {
      return {};
    }
    const { fields } = payload;
    const equalities: Filter<DTO>[] = [];
    const oredFilter = sortFields.reduce((dtoFilters, sortField, index) => {
      const keySetField = fields[index];
      if (keySetField.field !== sortField.field) {
        throw new Error(
          `Cursor Payload does not match query sort expected ${keySetField.field as string} found ${
            sortField.field as string
          }`,
        );
      }
      const isAsc = sortField.direction === SortDirection.ASC;
      const subFilter = {
        and: [...equalities, { [keySetField.field]: { [isAsc ? 'gt' : 'lt']: keySetField.value } }],
      } as Filter<DTO>;
      equalities.push({ [keySetField.field]: { eq: keySetField.value } } as Filter<DTO>);
      return [...dtoFilters, subFilter];
    }, [] as Filter<DTO>[]);
    return { or: oredFilter } as Filter<DTO>;
  }

  private getSortFields(query: Query<DTO>, opts: KeySetPagingOpts<DTO>): SortField<DTO>[] {
    const { sorting = [] } = query;
    const defaultSort = opts.defaultSort.filter((dsf) => !sorting.some((sf) => dsf.field === sf.field));
    const sortFields = [...sorting, ...defaultSort];
    return opts.isForward ? sortFields : invertSort(sortFields);
  }

  private createKeySetPayload(dto: DTO, fields: (keyof DTO)[]): KeySetCursorPayload<DTO> {
    const fieldSet = new Set<keyof DTO>();
    return fields.reduce(
      (payload: KeySetCursorPayload<DTO>, field) => {
        if (fieldSet.has(field)) {
          return payload;
        }
        fieldSet.add(field);
        payload.fields.push({ field, value: dto[field] });
        return payload;
      },
      { type: 'keyset', fields: [] },
    );
  }
}
