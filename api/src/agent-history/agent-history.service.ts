import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AgentHistory, AgentHistoryDocument } from '../schemas/agent-history.schema';

@Injectable()
export class AgentHistoryService {
  constructor(
    @InjectModel(AgentHistory.name) private agentHistoryModel: Model<AgentHistoryDocument>,
  ) {}

  async create(input: string, finishData: any): Promise<AgentHistory> {
    const createdHistory = new this.agentHistoryModel({
      input,
      finish_data: finishData,
    });
    return createdHistory.save();
  }

  async findAll(): Promise<AgentHistory[]> {
    return this.agentHistoryModel.find().sort({ created_at: -1 }).exec();
  }

  async findById(id: string): Promise<AgentHistory | null> {
    return this.agentHistoryModel.findById(id).exec();
  }
}