import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import type { CreateAccountDto } from './dto/create-account.dto';
import type { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.account.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const acc = await this.prisma.account.findFirst({
      where: { id, tenantId, deletedAt: null },
    });
    if (!acc) throw new NotFoundException('Conta não encontrada');
    return acc;
  }

  async getBalance(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    const result = await this.prisma.financialEntry.aggregate({
      where: {
        accountId: id,
        tenantId,
        deletedAt: null,
        settledAt: { not: null },
      },
      _sum: { value: true },
    });
    const sum = result._sum.value ?? new Decimal(0);
    const outgoing = await this.prisma.financialEntry.aggregate({
      where: {
        accountId: id,
        tenantId,
        deletedAt: null,
        settledAt: { not: null },
        type: { in: ['expense', 'transfer_out'] },
      },
      _sum: { value: true },
    });
    const incoming = await this.prisma.financialEntry.aggregate({
      where: {
        accountId: id,
        tenantId,
        deletedAt: null,
        settledAt: { not: null },
        type: { in: ['income', 'transfer_in'] },
      },
      _sum: { value: true },
    });
    const inVal = (incoming._sum.value ?? new Decimal(0)) as Decimal;
    const outVal = (outgoing._sum.value ?? new Decimal(0)) as Decimal;
    const balance = inVal.sub(outVal);
    return { balance: balance.toNumber() };
  }

  async create(tenantId: string, dto: CreateAccountDto) {
    return this.prisma.account.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        bankCode: dto.bankCode,
        agency: dto.agency,
        accountNumber: dto.accountNumber,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateAccountDto) {
    await this.findOne(tenantId, id);
    return this.prisma.account.update({
      where: { id },
      data: {
        ...(dto.name != null && { name: dto.name }),
        ...(dto.type != null && { type: dto.type }),
        ...(dto.bankCode !== undefined && { bankCode: dto.bankCode }),
        ...(dto.agency !== undefined && { agency: dto.agency }),
        ...(dto.accountNumber !== undefined && { accountNumber: dto.accountNumber }),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.account.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
