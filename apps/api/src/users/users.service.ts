import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
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
  }

  async updateProfile(id: string, data: { name?: string; phone?: string; email?: string; avatarUrl?: string }) {
    if (data.email) {
      const existingEmail = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail && existingEmail.id !== id) {
        throw new BadRequestException('Email already in use');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
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
  }
}
