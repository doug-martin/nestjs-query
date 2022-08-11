import { prop } from '@typegoose/typegoose'

import { TestEntity } from './test.entity'

export class TestDiscriminatedEntity extends TestEntity {
  @prop({ required: true })
  stringType2!: string
}
