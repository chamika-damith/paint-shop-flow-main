import api from './config';
import { InventoryItem } from '@/types';

const INVENTORY_URL = '/inventory';

export const inventoryApi = {
  getAll: () => api.get<InventoryItem[]>(INVENTORY_URL),
  getById: (id: string) => api.get<InventoryItem>(`${INVENTORY_URL}/${id}`),
  create: (item: Omit<InventoryItem, 'id' | '_id'>) => api.post<InventoryItem>(INVENTORY_URL, item),
  update: (id: string, item: Partial<InventoryItem>) => api.put<InventoryItem>(`${INVENTORY_URL}/${id}`, item),
  delete: (id: string) => api.delete(`${INVENTORY_URL}/${id}`),
}; 