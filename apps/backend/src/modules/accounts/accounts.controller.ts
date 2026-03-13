import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { TenantId } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @RequirePermission('account:view')
  @ApiOperation({ summary: 'Listar contas do tenant' })
  findAll(@TenantId() tenantId: string) {
    return this.accountsService.findAll(tenantId);
  }

  @Get(':id')
  @RequirePermission('account:view')
  @ApiOperation({ summary: 'Buscar conta por id' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.accountsService.findOne(tenantId, id);
  }

  @Get(':id/balance')
  @RequirePermission('account:view')
  @ApiOperation({ summary: 'Saldo da conta' })
  getBalance(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.accountsService.getBalance(tenantId, id);
  }

  @Post()
  @RequirePermission('account:edit')
  @ApiOperation({ summary: 'Criar conta' })
  create(@TenantId() tenantId: string, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(tenantId, dto);
  }

  @Patch(':id')
  @RequirePermission('account:edit')
  @ApiOperation({ summary: 'Atualizar conta' })
  update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @RequirePermission('account:edit')
  @ApiOperation({ summary: 'Excluir conta (soft delete)' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.accountsService.remove(tenantId, id);
  }
}
