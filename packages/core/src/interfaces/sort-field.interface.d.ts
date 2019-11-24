export declare enum SortDirection {
    ASC = "ASC",
    DESC = "DESC"
}
export declare enum SortNulls {
    NULLS_FIRST = "NULLS FIRST",
    NULLS_LAST = "NULLS LAST"
}
export interface SortField<T> {
    field: keyof T;
    direction: SortDirection;
    nulls?: SortNulls;
}
