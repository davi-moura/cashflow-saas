import { api } from './client';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories');
  return data;
}

export async function createCategory(body: { name: string; type: 'income' | 'expense' }): Promise<Category> {
  const { data } = await api.post<Category>('/categories', body);
  return data;
}

export async function updateCategory(id: string, body: Partial<{ name: string; type: 'income' | 'expense' }>): Promise<Category> {
  const { data } = await api.patch<Category>(`/categories/${id}`, body);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
