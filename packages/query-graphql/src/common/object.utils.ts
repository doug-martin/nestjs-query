export const removeUndefinedValues = <T>(obj: T): T => {
  const keys = Object.keys(obj) as (keyof T)[]
  return keys.reduce((cleansed: T, key) => {
    if (obj[key] === undefined) {
      return cleansed
    }
    return { ...cleansed, [key]: obj[key] }
  }, {} as T)
}
