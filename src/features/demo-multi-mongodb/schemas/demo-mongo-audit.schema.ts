import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DemoMongoAuditDocument = HydratedDocument<DemoMongoAudit>;

@Schema({
  collection: 'demo_mongo_audit',
  timestamps: true,
})
export class DemoMongoAudit {
  @Prop({ required: true })
  readonly demoId: string;

  @Prop({ required: true, maxlength: 50 })
  readonly action: string;
}

export const DemoMongoAuditSchema =
  SchemaFactory.createForClass(DemoMongoAudit);
