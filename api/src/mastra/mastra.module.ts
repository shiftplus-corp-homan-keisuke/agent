import { Module } from '@nestjs/common';
import { MastraService } from './mastra.service';
import { AgentHistoryModule } from '../agent-history/agent-history.module';

@Module({
  imports: [AgentHistoryModule],
  providers: [MastraService],
  exports: [MastraService],
})
export class MastraModule {}