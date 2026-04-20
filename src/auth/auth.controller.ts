import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

class LoginDto {
  email!: string;
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const { email, password } = body;

    const result = await this.authService.login(email, password);

    return {
      status: true,
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const data = await this.authService.getProfile(req.user.sub);

    return {
      status: true,
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async updateProfile(@Req() req: any, @Body() body: UpdateProfileDto) {
    const data = await this.authService.updateProfile(req.user.sub, body);

    return {
      status: true,
      data,
    };
  }
}
