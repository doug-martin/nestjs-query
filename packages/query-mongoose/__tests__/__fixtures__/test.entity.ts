import { Document, Types, SchemaTypes } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TestReference } from 'packages/query-mongoose/__tests__/__fixtures__/test-reference.entity';

@Schema()
export class TestEntity extends Document {
  @Prop({ required: true })
  stringType!: string;

  @Prop({ required: true })
  boolType!: boolean;

  @Prop({ required: true })
  numberType!: number;

  @Prop({ required: true })
  dateType!: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'TestReference' })
  testReference?: Types.ObjectId;

  @Prop([{ type: SchemaTypes.ObjectId, ref: 'TestReference' }])
  testReferences?: Types.ObjectId[];

  virtualTestReference?: TestReference;
}

export const TestEntitySchema = SchemaFactory.createForClass(TestEntity);
TestEntitySchema.virtual('virtualTestReferences', {
  ref: 'TestReference',
  localField: '_id',
  foreignField: 'testEntity',
});
