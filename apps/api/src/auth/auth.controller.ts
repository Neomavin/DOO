import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getProfile(@Request() req) {
    return req.user;
  }
}
