export function getSchemaKey(key: string): string {
  return key === 'id' ? '_id' : key;
}
