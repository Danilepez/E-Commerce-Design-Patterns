/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { ChatBotService } from './chatbot.service';

@Controller('chatbot')
export class ChatBotController {
  constructor(private readonly chatBotService: ChatBotService) {}

  @Post('ask')
  async askAI(@Body() body: { messages: Array<{ role: string; content: string }> }) {
    const text = await this.chatBotService.getAIResponse(body.messages);
    return { text };
  }

  @Post('extract-category')
  async extractCategory(@Body() body: { message: string }) {
    const category = await this.chatBotService.extractCategory(body.message);
    return { category };
  }
}