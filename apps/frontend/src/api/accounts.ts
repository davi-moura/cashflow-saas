import { api } from './client';

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'cash';
  bankCode?: string;
  agency?: string;
  accountNumber?: string;
}

export async function fetchAccounts(): Promise<Account[]> {
  const { data } = await api.get<Account[]>('/accounts');
  return data;
}

export async function createAccount(body: {
  name: string;
  type: 'bank' | 'cash';
  bankCode?: string;
  agency?: string;
  accountNumber?: string;
}): Promise<Account> {
  const { data } = await api.post<Account>('/accounts', body);
  return data;
}

export async function updateAccount(
  id: string,
  body: Partial<{ name: string; type: 'bank' | 'cash'; bankCode?: string; agency?: string; accountNumber?: string }>
): Promise<Account> {
  const { data } = await api.patch<Account>(`/accounts/${id}`, body);
  return data;
}

export async function deleteAccount(id: string): Promise<void> {
  await api.delete(`/accounts/${id}`);
}
