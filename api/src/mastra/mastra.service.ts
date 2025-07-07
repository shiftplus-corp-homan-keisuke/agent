import { Injectable } from '@nestjs/common';
import { Agent } from '@mastra/core';
import { anthropic } from '@ai-sdk/anthropic';
import { weatherInfo } from 'src/tools/weatherInfo';
import { webFetch } from 'src/tools/webFetch';
import { AgentHistoryService } from '../agent-history/agent-history.service';

@Injectable()
export class MastraService {

  constructor(private readonly agentHistoryService: AgentHistoryService) { }

  factoryAgent() {
    return new Agent({
      name: 'nestjs-agent',
      instructions: 'You are a helpful assistant integrated with NestJS.',
      model: anthropic('claude-3-5-sonnet-20241022'),
      tools: {
        weatherInfo,
        webFetch
      }
    });
  }

  async executeAgent(input: string) {
    try {
      const result = await this.factoryAgent().generate(input);
      return result.text;
    } catch (error) {
      throw new Error(`Agent execution failed: ${error.message}`);
    }
  }

  async streamAgent(input: string) {
    const agent = new Agent({
      name: 'nestjs-agent',
      instructions: 'You are a helpful assistant integrated with NestJS.',
      model: anthropic('claude-3-5-sonnet-20241022'),
      tools: {
        weatherInfo,
        webFetch
      },
    });

    try {
      const result = await agent.stream(input, {
        maxSteps: 5,
        onFinish: async (finish) => {
          try {
            await this.agentHistoryService.create(input, finish);
            console.log('Agent history saved to database');
          } catch (error) {
            console.error('Failed to save agent history:', error);
          }
        }
      });

      return result;
    } catch (error) {
      throw new Error(`Agent streaming failed: ${error.message}`);
    }
  }
}