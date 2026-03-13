import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FinancialEntriesService } from './financial-entries.service';
import { CreateEntryDto } from './dto/create-entry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('financial-entries')
@ApiBearerAuth()
@Controller('financial-entries')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FinancialEntriesController {
  constructor(private readonly financialEntriesService: FinancialEntriesService) {}

  @Get()
  @RequirePermission('entry:view')
  @ApiOperation({ summary: 'Listar lançamentos' })
  findAll(
    @TenantId() tenantId: string,
    @Query('accountId') accountId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
  ) {
    return this.financialEntriesService.findAll(tenantId, {
      accountId,
      startDate,
      endDate,
      type,
    });
  }

  @Get(':id')
  @RequirePermission('entry:view')
  @ApiOperation({ summary: 'Buscar lançamento por id' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.financialEntriesService.findOne(tenantId, id);
  }

  @Post()
  @RequirePermission('entry:edit')
  @ApiOperation({ summary: 'Criar lançamento' })
  create(@TenantId() tenantId: string, @Body() dto: CreateEntryDto) {
    return this.financialEntriesService.create(tenantId, dto);
  }
}
