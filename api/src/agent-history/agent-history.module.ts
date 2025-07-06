import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentHistory, AgentHistorySchema } from '../schemas/agent-history.schema';
import { AgentHistoryService } from './agent-history.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AgentHistory.name, schema: AgentHistorySchema }])
  ],
  providers: [AgentHistoryService],
  exports: [AgentHistoryService],
})
export class AgentHistoryModule {}