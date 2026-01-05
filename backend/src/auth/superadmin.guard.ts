import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const role = request?.user?.role;
    if (role !== 'superadmin') {
      throw new ForbiddenException('Akses khusus superadmin');
    }
    return true;
  }
}
