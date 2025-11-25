import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { GenerateDescriptionDto } from './dto/generate-description.dto';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('descriptions')
  @ApiOperation({ summary: 'Generate marketing description for a dish' })
  async generateDescription(@Body() dto: GenerateDescriptionDto) {
    return this.aiService.generateDescription(dto);
  }
}
