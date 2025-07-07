import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentHistoryDocument = AgentHistory & Document;

@Schema({ 
  collection: 'agent_histories',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})
export class AgentHistory {
  @Prop({ required: true })
  input: string;

  @Prop({ type: Object, required: true })
  finish_data: any;
}

export const AgentHistorySchema = SchemaFactory.createForClass(AgentHistory);