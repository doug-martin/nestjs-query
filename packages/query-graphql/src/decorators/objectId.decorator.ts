import { Transform } from 'class-transformer'

export const ObjectId = () => (target: unknown, propertyKey: string) => {
  Transform((obj) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return obj.obj[obj.key]
  })(target, propertyKey)
}
