import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { RegisterInstitutionDto } from './dto/register-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';

@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Post('register')
  async register(@Body() body: RegisterInstitutionDto) {
    const data = await this.institutionsService.register(body);

    return {
      status: true,
      data,
    };
  }

  @Get()
  async list() {
    const data = await this.institutionsService.listPublic();
    return { status: true, data };
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.institutionsService.findBySlug(slug);

    if (!data) {
      return {
        status: false,
        message: 'Instansi tidak ditemukan',
      };
    }

    return {
      status: true,
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request & { user: { sub: number; email: string } }) {
    const inst = await this.institutionsService.findByUserId(req.user.sub);
    if (!inst) {
      return { status: false, message: 'Instansi tidak ditemukan' };
    }
    return { status: true, data: inst };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @Req() req: Request & { user: { sub: number; email: string } },
    @Body() body: UpdateInstitutionDto,
  ) {
    const updated = await this.institutionsService.updateForUser(
      req.user.sub,
      body,
    );
    return { status: true, data: updated };
  }
}
