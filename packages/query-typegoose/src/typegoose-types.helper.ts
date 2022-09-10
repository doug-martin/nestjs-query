import { mongoose } from '@typegoose/typegoose'

export type ReferenceOptions = {
  type: mongoose.SchemaType
  ref: string
}

export type UpdateArrayQuery<T> = {
  $addToSet: {
    [key: string]: {
      $each: T[]
    }
  }

  $pull: {
    [key: string]: {
      [key: string]: {
        $in: T[keyof T][]
      }
    }
  }
}

export function isReferenceOptions(options: unknown): options is ReferenceOptions {
  return (
    typeof options === 'object' &&
    options !== null &&
    'type' in options &&
    'ref' in options &&
    typeof (options as { ref: unknown }).ref === 'string'
  )
}

export type SchemaTypeWithReferenceOptions = {
  options: ReferenceOptions
}

export function isSchemaTypeWithReferenceOptions(type: unknown): type is SchemaTypeWithReferenceOptions {
  if (type && typeof type === 'object' && 'options' in type) {
    const { options } = type as { options: unknown }
    return isReferenceOptions(options)
  }
  return false
}

export type EmbeddedSchemaTypeOptions = {
  $embeddedSchemaType: { options: ReferenceOptions }
}

export function isEmbeddedSchemaTypeOptions(options: unknown): options is EmbeddedSchemaTypeOptions {
  if (options && typeof options === 'object' && '$embeddedSchemaType' in options) {
    const { $embeddedSchemaType } = options as { $embeddedSchemaType: { options: unknown } }
    return isReferenceOptions($embeddedSchemaType.options)
  }
  return false
}

export type VirtualReferenceOptions = {
  ref: string
  localField: string
  foreignField: string
}

export function isVirtualReferenceOptions(options: unknown): options is VirtualReferenceOptions {
  return (
    typeof options === 'object' && options !== null && 'ref' in options && 'localField' in options && 'foreignField' in options
  )
}

export type VirtualTypeWithOptions = {
  options: VirtualReferenceOptions
}

export function isVirtualTypeWithReferenceOptions(virtualType: unknown): virtualType is VirtualTypeWithOptions {
  if (virtualType && typeof virtualType === 'object' && 'options' in virtualType) {
    const { options } = virtualType as { options: unknown }
    return isVirtualReferenceOptions(options)
  }
  return false
}
