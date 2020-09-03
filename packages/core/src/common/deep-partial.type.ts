/**
 * Create a Partial that will allow for partials of nested objects and arrays.
 */
export declare type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U2>
    ? ReadonlyArray<DeepPartial<U2>>
    : DeepPartial<T[P]>;
};
