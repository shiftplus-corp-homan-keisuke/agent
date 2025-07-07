import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { MastraModule } from '../mastra/mastra.module';
import { AgentMessageModule } from '../agent-message/agent-message.module';

@Module({
  imports: [MastraModule, AgentMessageModule],
  controllers: [AgentController],
})
export class AgentModule {}