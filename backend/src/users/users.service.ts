import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.users.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        institution: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async update(userId: number, dto: UpdateUserDto) {
    const existing = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, role: true, institutionId: true },
    });

    if (!existing) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const data: UpdateUserDto = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;

    if (dto.role !== undefined) {
      data.role = dto.role;
      if (dto.role === 'superadmin') {
        data.institutionId = null;
      }
    }

    if (dto.institutionId !== undefined && dto.role !== 'superadmin') {
      data.institutionId = dto.institutionId;
    }

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(dto.password, salt);
    }

    const updated = await this.prisma.users.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        institution: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(requestorId: number, userId: number) {
    if (requestorId === userId) {
      throw new ForbiddenException('Tidak bisa menghapus akun sendiri');
    }

    await this.prisma.users.delete({ where: { id: userId } });
  }
}
