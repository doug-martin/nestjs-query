export const isInAllowedList = <T>(arr: T[] | undefined, val: T) => arr?.includes(val) ?? true;
