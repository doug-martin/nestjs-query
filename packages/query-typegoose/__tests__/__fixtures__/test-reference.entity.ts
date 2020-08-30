import { mongoose, prop } from '@typegoose/typegoose';

export class TestReference {
  get id(): string {
    const idKey = '_id';
    return ((this as unknown) as Record<string, mongoose.Types.ObjectId>)[idKey]?.toString();
  }

  @prop({ required: true })
  name!: string;

  getOutputData(): TestReference {
    return {
      ...this,
      id: this.id,
    };
  }
}
