import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AgentMessage, AgentMessageDocument } from '../schemas/agent-message.schema';

@Injectable()
export class AgentMessageService {
  constructor(
    @InjectModel(AgentMessage.name) private agentMessageModel: Model<AgentMessageDocument>,
  ) {}

  async create(sessionId: string, input: string, chunks: any[]): Promise<AgentMessage> {
    const createdMessage = new this.agentMessageModel({
      session_id: sessionId,
      input: input,
      chunks: chunks,
    });
    return createdMessage.save();
  }

  async findBySessionId(sessionId: string): Promise<AgentMessage | null> {
    return this.agentMessageModel.findOne({ session_id: sessionId }).exec();
  }

  async findAll(): Promise<AgentMessage[]> {
    return this.agentMessageModel.find().sort({ created_at: -1 }).exec();
  }
}