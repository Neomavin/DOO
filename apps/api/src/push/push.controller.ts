import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PushService } from './push.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegisterPushDto } from './dto/register-push.dto';
import { SendPushDto, SendBulkPushDto } from './dto/send-push.dto';

@ApiTags('push')
@Controller('push')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PushController {
  constructor(private pushService: PushService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register push token' })
  async registerToken(@Request() req, @Body() body: RegisterPushDto) {
    return this.pushService.registerToken(req.user.id, body.pushToken);
  }

  @Post('send')
  @ApiOperation({ summary: 'Send push notification' })
  async sendNotification(@Body() body: SendPushDto) {
    return this.pushService.sendPushNotification(body.userId, body.title, body.body);
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Send bulk push notifications' })
  async sendBulkNotifications(@Body() body: SendBulkPushDto) {
    return this.pushService.sendBulkNotifications(body.userIds, body.title, body.body);
  }
}
