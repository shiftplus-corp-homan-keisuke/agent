import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './agent/agent.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://admin:password@mongodb:27017/mastra_agent?authSource=admin'),
    AgentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
