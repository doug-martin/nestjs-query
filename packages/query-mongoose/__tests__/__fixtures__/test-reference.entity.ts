import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Document, Types } from 'mongoose';

@Schema()
export class TestReference extends Document {
  @Prop({ required: true })
  referenceName!: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'TestEntity' })
  testEntity?: Types.ObjectId;
}
export const TestReferenceSchema = SchemaFactory.createForClass(TestReference);
TestReferenceSchema.virtual('virtualTestEntity', {
  ref: 'TestEntity',
  localField: 'testEntity',
  foreignField: '_id',
  justOne: true
});
