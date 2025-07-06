import { Controller, Post, Body, HttpException, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { MastraService } from '../mastra/mastra.service';
import { AgentMessageService } from '../agent-message/agent-message.service';

class AgentExecuteDto {
  input: string;
}

@ApiTags('agent')
@Controller('agent')
export class AgentController {
  constructor(
    private readonly mastraService: MastraService,
    private readonly agentMessageService: AgentMessageService
  ) { }

  @Post('execute')
  @ApiOperation({ summary: 'Execute agent with input' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Input text for the agent' }
      },
      required: ['input']
    }
  })
  @ApiResponse({ status: 200, description: 'Agent response' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async executeAgent(@Body() body: AgentExecuteDto): Promise<{ response: string }> {
    try {
      if (!body.input) {
        throw new HttpException('Input is required', HttpStatus.BAD_REQUEST);
      }

      const response = await this.mastraService.executeAgent(body.input);
      return { response };
    } catch (error) {
      throw new HttpException(
        error.message || 'Agent execution failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('stream')
  @ApiOperation({ summary: 'Stream agent response via SSE' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        input: { type: 'string', description: 'Input text for the agent' }
      },
      required: ['input']
    }
  })
  @ApiResponse({ status: 200, description: 'Agent stream response via SSE' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async streamAgent(@Body() body: AgentExecuteDto, @Res() res: any): Promise<void> {
    try {
      if (!body.input) {
        throw new HttpException('Input is required', HttpStatus.BAD_REQUEST);
      }

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      const stream = await this.mastraService.streamAgent(body.input);
      
      const sessionId = Date.now().toString();
      const chunks: any[] = [];

      // Stream the response chunks
      for await (const chunk of stream.fullStream) {
        chunks.push(chunk);
        
        res.write(`data: ${JSON.stringify({ chunk })}

`);
      }
      
      // Save all chunks as single document
      try {
        await this.agentMessageService.create(sessionId, body.input, chunks);
        console.log(`Saved ${chunks.length} chunks for session ${sessionId}`);
      } catch (error) {
        console.error('Failed to save chunks:', error);
      }

      // Send end event
      res.write(`data: ${JSON.stringify({ done: true })}

`);
      res.end();
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Agent streaming failed' })}

`);
      res.end();
    }
  }
}