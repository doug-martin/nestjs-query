import { Class } from '@nestjs-query/core';
import {
  PagingStrategies,
  StaticNoPagingQueryArgsType,
  StaticOffsetQueryArgsType,
  StaticQueryArgsType,
} from '../query';
import { ArrayConnectionType, StaticArrayConnectionType } from './array-connection.type';
import { StaticCursorConnectionType, CursorConnectionType } from './cursor';
import { Connection } from './interfaces';

export type StaticConnectionType<DTO> = StaticArrayConnectionType<DTO> | StaticCursorConnectionType<DTO>;
export type ConnectionType<DTO> = Connection<DTO>;

export function ConnectionType<DTO>(
  DTOClass: Class<DTO>,
  QueryArgsType: StaticOffsetQueryArgsType<DTO> | StaticNoPagingQueryArgsType<DTO>,
): StaticArrayConnectionType<DTO>;
export function ConnectionType<DTO>(
  DTOClass: Class<DTO>,
  QueryArgsType: StaticQueryArgsType<DTO>,
): StaticCursorConnectionType<DTO>;
export function ConnectionType<DTO>(DTOClass: Class<DTO>): StaticCursorConnectionType<DTO>;
export function ConnectionType<DTO, QueryType extends StaticQueryArgsType<DTO>>(
  DTOClass: Class<DTO>,
  QueryArgsType?: QueryType,
): StaticConnectionType<DTO> {
  if (QueryArgsType) {
    const { PageType } = QueryArgsType;
    if (!PageType || PageType.strategy === PagingStrategies.OFFSET) {
      return ArrayConnectionType(DTOClass);
    }
  }
  return CursorConnectionType(DTOClass);
}
