import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentMessage, AgentMessageSchema } from '../schemas/agent-message.schema';
import { AgentMessageService } from './agent-message.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AgentMessage.name, schema: AgentMessageSchema }])
  ],
  providers: [AgentMessageService],
  exports: [AgentMessageService],
})
export class AgentMessageModule {}