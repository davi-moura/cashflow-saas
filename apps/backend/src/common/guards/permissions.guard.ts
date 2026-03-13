import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user as { sub: string; tenantId?: string };
    if (!user?.sub || !user?.tenantId) throw new ForbiddenException('Contexto de tenant ausente');
    const tenantUser = await this.prisma.tenantUser.findFirst({
      where: { userId: user.sub, tenantId: user.tenantId },
      include: { role: { include: { rolePermissions: { include: { permission: true } } } } },
    });
    if (!tenantUser) throw new ForbiddenException('Sem acesso a esta empresa');
    const slugs = new Set(
      tenantUser.role.rolePermissions.map(
        (rp: { permission: { slug: string } }) => rp.permission.slug,
      ),
    );
    const hasAll = required.every((p) => slugs.has(p));
    if (!hasAll) throw new ForbiddenException('Permissão insuficiente');
    return true;
  }
}
