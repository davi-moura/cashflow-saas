import { api } from './client';

export interface DashboardSummary {
  totalBalance: number;
  balances: { accountId: string; accountName: string; type: string; balance: number }[];
  period: { startDate: string; endDate: string };
  entriesInPeriod: number;
  exitsInPeriod: number;
}

export async function fetchDashboard(startDate?: string, endDate?: string): Promise<DashboardSummary> {
  const params = new URLSearchParams();
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const { data } = await api.get<DashboardSummary>(`/dashboard?${params}`);
  return data;
}
