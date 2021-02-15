import { Class } from '@nestjs-query/core';
import { PagingStrategies } from '../query';
import { ArrayConnectionOptions, ArrayConnectionType, StaticArrayConnectionType } from './array-connection.type';
import { CursorConnectionOptions, CursorConnectionType, StaticCursorConnectionType } from './cursor';
import { Connection } from './interfaces';
import { OffsetConnectionOptions, OffsetConnectionType, StaticOffsetConnectionType } from './offset';

export type StaticConnectionType<DTO> =
  | StaticArrayConnectionType<DTO>
  | StaticCursorConnectionType<DTO>
  | StaticOffsetConnectionType<DTO>;
export type ConnectionType<DTO> = Connection<DTO>;
export type ConnectionOptions = CursorConnectionOptions | OffsetConnectionOptions | ArrayConnectionOptions;

export function ConnectionType<DTO>(
  DTOClass: Class<DTO>,
  opts: OffsetConnectionOptions,
): StaticOffsetConnectionType<DTO>;
export function ConnectionType<DTO>(DTOClass: Class<DTO>, opts: ArrayConnectionOptions): StaticArrayConnectionType<DTO>;
export function ConnectionType<DTO>(
  DTOClass: Class<DTO>,
  opts?: CursorConnectionOptions,
): StaticCursorConnectionType<DTO>;
export function ConnectionType<DTO>(DTOClass: Class<DTO>, opts?: ConnectionOptions): StaticConnectionType<DTO>;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function ConnectionType<DTO>(
  DTOClass: Class<DTO>,
  maybeOpts: ConnectionOptions = { pagingStrategy: PagingStrategies.CURSOR },
): StaticConnectionType<DTO> {
  const opts = maybeOpts ?? { pagingStrategy: PagingStrategies.CURSOR };
  if (opts.pagingStrategy === PagingStrategies.OFFSET) {
    return OffsetConnectionType(DTOClass, opts);
  }
  if (opts.pagingStrategy === PagingStrategies.NONE) {
    return ArrayConnectionType(DTOClass);
  }
  return CursorConnectionType(DTOClass, opts);
}
