export const ROLES = ['admin', 'financeiro', 'gestor', 'operador'] as const;
export type RoleSlug = (typeof ROLES)[number];

export const PERMISSIONS = {
  // Tenants
  TENANT_VIEW: 'tenant:view',
  TENANT_EDIT: 'tenant:edit',

  // Users
  USER_VIEW: 'user:view',
  USER_EDIT: 'user:edit',

  // Accounts
  ACCOUNT_VIEW: 'account:view',
  ACCOUNT_EDIT: 'account:edit',

  // Categories
  CATEGORY_VIEW: 'category:view',
  CATEGORY_EDIT: 'category:edit',

  // Cost centers
  COST_CENTER_VIEW: 'cost_center:view',
  COST_CENTER_EDIT: 'cost_center:edit',

  // Customers / Suppliers
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_EDIT: 'customer:edit',
  SUPPLIER_VIEW: 'supplier:view',
  SUPPLIER_EDIT: 'supplier:edit',

  // Financial
  ENTRY_VIEW: 'entry:view',
  ENTRY_EDIT: 'entry:edit',
  PAYABLE_VIEW: 'payable:view',
  PAYABLE_EDIT: 'payable:edit',
  RECEIVABLE_VIEW: 'receivable:view',
  RECEIVABLE_EDIT: 'receivable:edit',
  RECONCILIATION_VIEW: 'reconciliation:view',
  RECONCILIATION_EDIT: 'reconciliation:edit',

  // Reports
  REPORT_VIEW: 'report:view',
  DASHBOARD_VIEW: 'dashboard:view',

  // Audit
  AUDIT_VIEW: 'audit:view',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_EDIT: 'settings:edit',
} as const;
