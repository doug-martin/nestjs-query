import { mongoose, prop } from '@typegoose/typegoose';

export class TestReference {
  get id() {
    const idKey = '_id';
    return ((this as unknown) as Record<string, mongoose.Types.ObjectId>)[idKey]?.toString();
  }

  @prop({ required: true })
  name!: string;
}
