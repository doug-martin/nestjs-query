export interface BooleanFieldComparisons {
    is?: boolean | null;
    isNot?: boolean | null;
}
export interface CommonFieldComparisonType<FieldType> extends BooleanFieldComparisons {
    eq?: FieldType;
    neq?: FieldType;
    gt?: FieldType;
    gte?: FieldType;
    lt?: FieldType;
    lte?: FieldType;
    in?: FieldType[];
    notIn?: FieldType[];
}
export interface StringFieldComparisons extends CommonFieldComparisonType<string> {
    like?: string;
    notLike?: string;
    iLike?: string;
    notILike?: string;
}
export declare type FilterFieldComparison<FieldType> = FieldType extends string ? StringFieldComparisons : FieldType extends boolean ? BooleanFieldComparisons : FieldType extends null | undefined | never ? BooleanFieldComparisons : CommonFieldComparisonType<FieldType>;
export declare type FilterComparisonOperators<FieldType> = keyof FilterFieldComparison<FieldType>;
