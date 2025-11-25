import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async register(data: { email: string; password: string; name: string; phone?: string; address?: string; role?: string }) {
    const { email, password, name, phone, address } = data;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: { email, passwordHash, name, phone, role: data.role ?? 'CLIENT' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    if (address) {
      await this.prisma.address.create({
        data: {
          userId: user.id,
          label: 'Casa',
          line1: address,
          city: 'Ocotepeque',
          lat: 0,
          lng: 0,
          isDefault: true,
        },
      });
    }

    const tokens = await this.generateTokens(user.id);
    return { user, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { revoked: true },
    });

    const tokens = await this.generateTokens(storedToken.userId);

    const user = await this.prisma.user.findUnique({
      where: { id: storedToken.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { user, ...tokens };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId, role: (await this.prisma.user.findUnique({ where: { id: userId } })).role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId, token: refreshToken, expiresAt },
    });

    return { accessToken, refreshToken };
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // No revelamos si el usuario existe
      return { message: 'Si tu correo existe, te enviaremos instrucciones.' };
    }

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    this.sendPasswordResetEmail(user.email, token);

    return { message: 'Si tu correo existe, te enviaremos instrucciones.' };
  }

  async resetPassword(token: string, password: string) {
    const reset = await this.prisma.passwordResetToken.findUnique({ where: { token } });
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await this.prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash },
    });

    await this.prisma.passwordResetToken.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  private sendPasswordResetEmail(email: string, token: string) {
    const appUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
    const resetLink = `${appUrl}/reset/${token}`;
    this.logger.log(`[PasswordReset] Enviar a ${email}: ${resetLink}`);
  }
}
