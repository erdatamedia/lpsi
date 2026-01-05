import { Body, Controller, Delete, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/superadmin.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import type { Request } from 'express';

type AuthRequest = Request & { user: { sub: number; email: string; role?: string } };

@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async list() {
    const data = await this.usersService.list();
    return { status: true, data };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    const userId = Number(id);
    const data = await this.usersService.update(userId, body);
    return { status: true, data };
  }

  @Delete(':id')
  async remove(@Req() req: AuthRequest, @Param('id') id: string) {
    const userId = Number(id);
    await this.usersService.remove(req.user.sub, userId);
    return { status: true, message: 'User dihapus' };
  }
}
