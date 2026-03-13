export type TenantId = string;
export type UserId = string;
export type RoleSlug = 'admin' | 'financeiro' | 'gestor' | 'operador';

export interface TenantContext {
  tenantId: string;
  userId: string;
  role: RoleSlug;
}
