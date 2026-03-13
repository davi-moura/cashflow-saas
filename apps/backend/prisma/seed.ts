import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'empresa-demo' },
    create: {
      name: 'Empresa Demo',
      slug: 'empresa-demo',
    },
    update: {},
  });

  const passwordHash = await argon2.hash('admin123');
  const user = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    create: {
      email: 'admin@empresa.com',
      passwordHash,
      name: 'Administrador',
    },
    update: {},
  });

  const roles = await Promise.all([
    prisma.role.upsert({ where: { slug: 'admin' }, create: { slug: 'admin', name: 'Administrador', description: 'Acesso total' }, update: {} }),
    prisma.role.upsert({ where: { slug: 'financeiro' }, create: { slug: 'financeiro', name: 'Financeiro', description: 'Lançamentos e relatórios' }, update: {} }),
    prisma.role.upsert({ where: { slug: 'gestor' }, create: { slug: 'gestor', name: 'Gestor', description: 'Visualização e aprovações' }, update: {} }),
    prisma.role.upsert({ where: { slug: 'operador' }, create: { slug: 'operador', name: 'Operador', description: 'Lançamentos simples' }, update: {} }),
  ]);

  const permissions = await Promise.all([
    prisma.permission.upsert({ where: { slug: 'category:view' }, create: { slug: 'category:view', name: 'Ver categorias' }, update: {} }),
    prisma.permission.upsert({ where: { slug: 'category:edit' }, create: { slug: 'category:edit', name: 'Editar categorias' }, update: {} }),
    prisma.permission.upsert({ where: { slug: 'account:view' }, create: { slug: 'account:view', name: 'Ver contas' }, update: {} }),
    prisma.permission.upsert({ where: { slug: 'account:edit' }, create: { slug: 'account:edit', name: 'Editar contas' }, update: {} }),
    prisma.permission.upsert({ where: { slug: 'entry:view' }, create: { slug: 'entry:view', name: 'Ver lançamentos' }, update: {} }),
    prisma.permission.upsert({ where: { slug: 'entry:edit' }, create: { slug: 'entry:edit', name: 'Editar lançamentos' }, update: {} }),
    prisma.permission.upsert({ where: { slug: 'dashboard:view' }, create: { slug: 'dashboard:view', name: 'Ver dashboard' }, update: {} }),
    prisma.permission.upsert({ where: { slug: 'tenant:view' }, create: { slug: 'tenant:view', name: 'Ver empresa' }, update: {} }),
    prisma.permission.upsert({ where: { slug: 'tenant:edit' }, create: { slug: 'tenant:edit', name: 'Editar empresa' }, update: {} }),
  ]);

  const adminRole = roles[0];
  for (const p of permissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: p.id } },
      create: { roleId: adminRole.id, permissionId: p.id },
      update: {},
    });
  }

  await prisma.tenantUser.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: user.id } },
    create: {
      tenantId: tenant.id,
      userId: user.id,
      roleId: adminRole.id,
    },
    update: {},
  });

  const catIncome = await prisma.category.findFirst({ where: { tenantId: tenant.id, type: 'income' } })
    ?? await prisma.category.create({
      data: { tenantId: tenant.id, name: 'Receita geral', type: 'income' },
    });
  const catExpense = await prisma.category.findFirst({ where: { tenantId: tenant.id, type: 'expense' } })
    ?? await prisma.category.create({
      data: { tenantId: tenant.id, name: 'Despesa geral', type: 'expense' },
    });

  await prisma.account.findFirst({ where: { tenantId: tenant.id, type: 'cash' } })
    ?? await prisma.account.create({
      data: { tenantId: tenant.id, name: 'Caixa', type: 'cash' },
    });
  await prisma.account.findFirst({ where: { tenantId: tenant.id, type: 'bank' } })
    ?? await prisma.account.create({
      data: {
        tenantId: tenant.id,
        name: 'Conta corrente',
        type: 'bank',
        bankCode: '001',
        agency: '0001',
        accountNumber: '12345-6',
      },
    });

  console.log('Seed concluído: tenant', tenant.slug, 'usuário', user.email, 'senha admin123');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
