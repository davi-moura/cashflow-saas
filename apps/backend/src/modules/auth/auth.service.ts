import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import type { LoginDto } from './dto/login.dto';
import type { AuthResponseDto, TenantResponseDto, UserResponseDto } from './dto/auth-response.dto';

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES ?? '15m';
const REFRESH_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email.toLowerCase(), deletedAt: null },
    });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const tenantUser = await this.prisma.tenantUser.findFirst({
      where: { userId: user.id },
      include: { tenant: true },
    });
    if (!tenantUser) throw new UnauthorizedException('Usuário sem empresa vinculada');

    const accessToken = this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        tenantId: tenantUser.tenantId,
      },
      { expiresIn: ACCESS_EXPIRES },
    );
    const refreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS);
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
      },
    });

    const expiresIn = this.parseExpiresToSeconds(ACCESS_EXPIRES);
    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: this.toUserDto(user),
      tenant: this.toTenantDto(tenantUser.tenant),
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const session = await this.prisma.session.findFirst({
      where: { refreshToken, revokedAt: null },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date())
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    const tenantUser = await this.prisma.tenantUser.findFirst({
      where: { userId: session.userId },
      include: { tenant: true },
    });
    if (!tenantUser) throw new UnauthorizedException('Usuário sem empresa vinculada');

    const accessToken = this.jwt.sign(
      {
        sub: session.user.id,
        email: session.user.email,
        tenantId: tenantUser.tenantId,
      },
      { expiresIn: ACCESS_EXPIRES },
    );
    return {
      accessToken,
      expiresIn: this.parseExpiresToSeconds(ACCESS_EXPIRES),
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { refreshToken },
      data: { revokedAt: new Date() },
    });
  }

  async switchTenant(userId: string, tenantId: string): Promise<{ accessToken: string; expiresIn: number; tenant: TenantResponseDto }> {
    const tenantUser = await this.prisma.tenantUser.findFirst({
      where: { userId, tenantId },
      include: { tenant: true },
    });
    if (!tenantUser) throw new UnauthorizedException('Usuário não pertence a esta empresa');
    const accessToken = this.jwt.sign(
      { sub: userId, tenantId, email: (await this.prisma.user.findUnique({ where: { id: userId } }))!.email },
      { expiresIn: ACCESS_EXPIRES },
    );
    return {
      accessToken,
      expiresIn: this.parseExpiresToSeconds(ACCESS_EXPIRES),
      tenant: this.toTenantDto(tenantUser.tenant),
    };
  }

  async validateUserByEmail(email: string, password: string): Promise<{ id: string; email: string } | null> {
    const user = await this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
    if (!user || !(await argon2.verify(user.passwordHash, password))) return null;
    return { id: user.id, email: user.email };
  }

  async getTenantsForUser(userId: string): Promise<TenantResponseDto[]> {
    const list = await this.prisma.tenantUser.findMany({
      where: { userId },
      include: { tenant: true },
    });
    return list.map((tu) => this.toTenantDto(tu.tenant));
  }

  private toUserDto(user: { id: string; email: string; name: string | null }): UserResponseDto {
    return { id: user.id, email: user.email, name: user.name ?? undefined };
  }

  private toTenantDto(tenant: { id: string; name: string; slug: string }): TenantResponseDto {
    return { id: tenant.id, name: tenant.name, slug: tenant.slug };
  }

  private parseExpiresToSeconds(exp: string): number {
    if (exp.endsWith('m')) return parseInt(exp, 10) * 60;
    if (exp.endsWith('h')) return parseInt(exp, 10) * 3600;
    if (exp.endsWith('d')) return parseInt(exp, 10) * 86400;
    return 900;
  }
}
