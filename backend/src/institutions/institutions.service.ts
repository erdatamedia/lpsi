/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { RegisterInstitutionDto } from './dto/register-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  async register(data: RegisterInstitutionDto) {
    // pastikan slug unik
    const existing = await this.prisma.institution.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictException('Slug instansi sudah digunakan');
    }

    // hash password admin
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(data.adminPassword, salt);

    // buat instansi + admin user dalam 1 transaksi
    const result = await this.prisma.$transaction(async (tx) => {
      const institution = await tx.institution.create({
        data: {
          name: data.name,
          slug: data.slug,
          trackingTitle: data.trackingTitle,
        },
      });

      const user = await tx.users.create({
        data: {
          name: data.adminName,
          email: data.adminEmail,
          password: hashed,
          institution: {
            connect: { id: institution.id },
          },
        },
      });

      return { institution, user };
    });

    return {
      institution: {
        id: result.institution.id,
        name: result.institution.name,
        slug: result.institution.slug,
        trackingTitle: result.institution.trackingTitle,
        logoUrl: result.institution.logoUrl ?? null,
      },
      admin: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    };
  }

  async findBySlug(slug: string) {
    return this.prisma.institution.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        trackingTitle: true,
        logoUrl: true,
        created_at: true,
      },
    });
  }

  async listPublic() {
    return this.prisma.institution.findMany({
      orderBy: { created_at: 'desc' },
      take: 50,
      select: {
        id: true,
        name: true,
        slug: true,
        trackingTitle: true,
        logoUrl: true,
        created_at: true,
      },
    });
  }

  async findByUserId(userId: number) {
    return this.prisma.institution.findFirst({
      where: { users: { some: { id: userId } } },
      select: {
        id: true,
        name: true,
        slug: true,
        trackingTitle: true,
        logoUrl: true,
        created_at: true,
      },
    });
  }

  async updateForUser(userId: number, dto: UpdateInstitutionDto) {
    const institution = await this.prisma.institution.findFirst({
      where: { users: { some: { id: userId } } },
      select: { id: true },
    });

    if (!institution) {
      throw new ConflictException('Instansi tidak ditemukan untuk user ini');
    }

    const data: UpdateInstitutionDto = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.trackingTitle !== undefined) data.trackingTitle = dto.trackingTitle;
    if (dto.logoUrl !== undefined) data.logoUrl = dto.logoUrl;

    const updated = await this.prisma.institution.update({
      where: { id: institution.id },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        trackingTitle: true,
        logoUrl: true,
      },
    });

    return updated;
  }
}
