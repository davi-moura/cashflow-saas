import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(tenantId: string, startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();
    const accounts = await this.prisma.account.findMany({
      where: { tenantId, deletedAt: null },
      select: { id: true, name: true, type: true },
    });
    const balances: { accountId: string; accountName: string; type: string; balance: number }[] = [];
    let totalBalance = 0;
    for (const acc of accounts) {
      const incoming = await this.prisma.financialEntry.aggregate({
        where: {
          accountId: acc.id,
          tenantId,
          deletedAt: null,
          settledAt: { not: null },
          type: { in: ['income', 'transfer_in'] },
        },
        _sum: { value: true },
      });
      const outgoing = await this.prisma.financialEntry.aggregate({
        where: {
          accountId: acc.id,
          tenantId,
          deletedAt: null,
          settledAt: { not: null },
          type: { in: ['expense', 'transfer_out'] },
        },
        _sum: { value: true },
      });
      const inVal = (incoming._sum.value ?? new Decimal(0)) as Decimal;
      const outVal = (outgoing._sum.value ?? new Decimal(0)) as Decimal;
      const balance = inVal.sub(outVal).toNumber();
      totalBalance += balance;
      balances.push({ accountId: acc.id, accountName: acc.name, type: acc.type, balance });
    }
    const entriesInPeriod = await this.prisma.financialEntry.findMany({
      where: {
        tenantId,
        deletedAt: null,
        settledAt: { not: null },
        competenceDate: { gte: start, lte: end },
      },
    });
    let entriesTotal = 0;
    let exitsTotal = 0;
    for (const e of entriesInPeriod) {
      const v = (e.value as Decimal).toNumber();
      if (e.type === 'income' || e.type === 'transfer_in') entriesTotal += v;
      else exitsTotal += v;
    }
    return {
      totalBalance,
      balances,
      period: { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) },
      entriesInPeriod: entriesTotal,
      exitsInPeriod: exitsTotal,
    };
  }
}
