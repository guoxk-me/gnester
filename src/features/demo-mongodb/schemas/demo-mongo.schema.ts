import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DemoMongoDocument = HydratedDocument<DemoMongo>;

@Schema({
  collection: 'demo_mongo',
  timestamps: true,
})
export class DemoMongo {
  @Prop({ required: true, maxlength: 20 })
  readonly name: string;

  @Prop({ required: true })
  readonly description: string;
}

export const DemoMongoSchema = SchemaFactory.createForClass(DemoMongo);
