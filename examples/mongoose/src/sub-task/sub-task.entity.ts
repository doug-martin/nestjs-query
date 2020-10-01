import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class SubTaskEntity extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  completed!: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'TodoItemEntity' })
  todoItem!: Types.ObjectId;

  @Prop()
  createdAt!: Date;

  @Prop()
  updatedAt!: Date;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;
}

export const SubTaskEntitySchema = SchemaFactory.createForClass(SubTaskEntity);
