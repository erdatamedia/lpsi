import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async validateUser(email: string, password: string) {
    const user = await this.prisma.users.findFirst({
      where: { email },
      include: {
        institution: true, // ambil relasi institution juga
      },
      orderBy: {
        id: 'desc', // pakai user terbaru jika email duplikat
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    const institution = user.institution
      ? {
          id: user.institution.id,
          name: user.institution.name,
          slug: user.institution.slug,
          trackingTitle: user.institution.trackingTitle,
        }
      : null;

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      institution,
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      include: {
        institution: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    const institution = user.institution
      ? {
          id: user.institution.id,
          name: user.institution.name,
          slug: user.institution.slug,
          trackingTitle: user.institution.trackingTitle,
        }
      : null;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      institution,
    };
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const updated = await this.prisma.users.update({
      where: { id: userId },
      data: {
        ...(dto.name ? { name: dto.name } : {}),
        ...(dto.email ? { email: dto.email } : {}),
      },
      include: {
        institution: true,
      },
    });

    const institution = updated.institution
      ? {
          id: updated.institution.id,
          name: updated.institution.name,
          slug: updated.institution.slug,
          trackingTitle: updated.institution.trackingTitle,
          logoUrl: updated.institution.logoUrl ?? null,
        }
      : null;

    return {
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
      },
      institution,
    };
  }
}
