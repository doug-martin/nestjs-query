export type NamedType = { name: string }
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export const isNamed = (SomeType: any): SomeType is NamedType =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  'name' in SomeType && typeof SomeType.name === 'string'
