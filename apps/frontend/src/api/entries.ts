import { api } from './client';

export interface FinancialEntry {
  id: string;
  accountId: string;
  categoryId: string | null;
  type: string;
  /** API pode retornar number ou string (Prisma Decimal) */
  value: number | string;
  description: string | null;
  competenceDate: string;
  settledAt: string | null;
  account?: { id: string; name: string; type: string };
  category?: { id: string; name: string; type: string } | null;
}

export async function fetchEntries(params?: {
  accountId?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
}): Promise<FinancialEntry[]> {
  const search = new URLSearchParams();
  if (params?.accountId) search.set('accountId', params.accountId);
  if (params?.startDate) search.set('startDate', params.startDate);
  if (params?.endDate) search.set('endDate', params.endDate);
  if (params?.type) search.set('type', params.type);
  const { data } = await api.get<FinancialEntry[]>(`/financial-entries?${search}`);
  return data;
}

export async function createEntry(body: {
  accountId: string;
  categoryId: string;
  type: 'income' | 'expense';
  value: number;
  description?: string;
  competenceDate: string;
  dueDate?: string;
}): Promise<FinancialEntry> {
  const { data } = await api.post<FinancialEntry>('/financial-entries', body);
  return data;
}
