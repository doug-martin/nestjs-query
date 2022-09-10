export const isInAllowedList = <T>(arr: T[] | undefined, val: T): boolean => arr?.includes(val) ?? true
