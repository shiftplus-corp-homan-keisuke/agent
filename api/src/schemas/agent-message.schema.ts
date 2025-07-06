import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AgentMessageDocument = AgentMessage & Document;

@Schema({ 
  collection: 'agent_messages',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})
export class AgentMessage {
  @Prop({ required: true })
  session_id: string;

  @Prop({ required: true })
  input: string;

  @Prop({ type: [Object], required: true })
  chunks: any[];
}

export const AgentMessageSchema = SchemaFactory.createForClass(AgentMessage);