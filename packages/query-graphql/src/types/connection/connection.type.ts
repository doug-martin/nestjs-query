import { Class } from '@nestjs-query/core';
import {
  PagingStrategies,
  StaticNoPagingQueryArgsType,
  StaticOffsetQueryArgsType,
  StaticQueryArgsType,
} from '../query';
import { ArrayConnectionType, StaticArrayConnectionType } from './array-connection.type';
import { StaticCursorConnectionType, CursorConnectionType, CursorConnectionOptions } from './cursor';
import { Connection } from './interfaces';
import { isStaticQueryArgsType } from '../query/query-args.type';

export type StaticConnectionType<DTO> = StaticArrayConnectionType<DTO> | StaticCursorConnectionType<DTO>;
export type ConnectionType<DTO> = Connection<DTO>;

export function ConnectionType<DTO>(
  DTOClass: Class<DTO>,
  QueryArgsType: StaticOffsetQueryArgsType<DTO> | StaticNoPagingQueryArgsType<DTO>,
): StaticArrayConnectionType<DTO>;
export function ConnectionType<DTO>(
  DTOClass: Class<DTO>,
  QueryArgsType: StaticQueryArgsType<DTO>,
  opts?: CursorConnectionOptions,
): StaticCursorConnectionType<DTO>;
export function ConnectionType<DTO>(
  DTOClass: Class<DTO>,
  opts?: CursorConnectionOptions,
): StaticCursorConnectionType<DTO>;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function ConnectionType<DTO, QueryType extends StaticQueryArgsType<DTO>>(
  DTOClass: Class<DTO>,
  QueryArgsType?: QueryType | CursorConnectionOptions,
  opts?: CursorConnectionOptions,
): StaticConnectionType<DTO> {
  if (isStaticQueryArgsType(QueryArgsType)) {
    const { PageType } = QueryArgsType;
    if (!PageType || PageType.strategy === PagingStrategies.OFFSET) {
      return ArrayConnectionType(DTOClass);
    }
  }
  let cursorOpts: CursorConnectionOptions | undefined = opts;
  if (!cursorOpts && !isStaticQueryArgsType(QueryArgsType)) {
    cursorOpts = QueryArgsType as CursorConnectionOptions;
  }
  return CursorConnectionType(DTOClass, cursorOpts);
}
