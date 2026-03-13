import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import type { CreateEntryDto } from './dto/create-entry.dto';

@Injectable()
export class FinancialEntriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateEntryDto) {
    await this.prisma.account.findFirstOrThrow({
      where: { id: dto.accountId, tenantId, deletedAt: null },
    });
    await this.prisma.category.findFirstOrThrow({
      where: { id: dto.categoryId, tenantId, deletedAt: null },
    });
    const competenceDate = new Date(dto.competenceDate);
    const value = new Decimal(dto.value);
    return this.prisma.financialEntry.create({
      data: {
        tenantId,
        accountId: dto.accountId,
        categoryId: dto.categoryId,
        type: dto.type,
        value,
        description: dto.description ?? null,
        competenceDate,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        settledAt: new Date(), // liquidação imediata no MVP
        costCenterId: dto.costCenterId ?? null,
        customerId: dto.customerId ?? null,
        supplierId: dto.supplierId ?? null,
      },
    });
  }

  async findAll(
    tenantId: string,
    filters: { accountId?: string; startDate?: string; endDate?: string; type?: string },
  ) {
    const where: Record<string, unknown> = { tenantId, deletedAt: null };
    if (filters.accountId) where.accountId = filters.accountId;
    if (filters.type) where.type = filters.type;
    if (filters.startDate || filters.endDate) {
      where.competenceDate = {};
      if (filters.startDate) (where.competenceDate as Record<string, Date>).gte = new Date(filters.startDate);
      if (filters.endDate) (where.competenceDate as Record<string, Date>).lte = new Date(filters.endDate);
    }
    return this.prisma.financialEntry.findMany({
      where,
      include: {
        account: { select: { id: true, name: true, type: true } },
        category: { select: { id: true, name: true, type: true } },
      },
      orderBy: { competenceDate: 'desc' },
      take: 200,
    });
  }

  async findOne(tenantId: string, id: string) {
    const entry = await this.prisma.financialEntry.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        account: true,
        category: true,
        costCenter: true,
        customer: true,
        supplier: true,
      },
    });
    if (!entry) throw new NotFoundException('Lançamento não encontrado');
    return entry;
  }
}
