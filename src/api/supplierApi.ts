import api from './config';
import { Supplier, InventoryItem, SupplierStatus } from '@/types';

const SUPPLIERS_URL = '/suppliers';

export const supplierApi = {
  getAllSuppliers: () => api.get<Supplier[]>(SUPPLIERS_URL),
  getSuppliersByCategory: (category: string) => api.get<Supplier[]>(`${SUPPLIERS_URL}/category/${category}`),
  getSupplierById: (id: string) => api.get<Supplier>(`${SUPPLIERS_URL}/${id}`),
  getSupplierInventory: (id: string) => api.get<InventoryItem[]>(`${SUPPLIERS_URL}/${id}/inventory`),
  createSupplier: (supplier: Omit<Supplier, '_id' | 'inventoryItems' | 'totalItems'>) => api.post<Supplier>(SUPPLIERS_URL, supplier),
  updateSupplier: (id: string, supplier: Partial<Omit<Supplier, '_id' | 'inventoryItems' | 'totalItems'>>) => api.put<Supplier>(`${SUPPLIERS_URL}/${id}`, supplier),
  updateSupplierStatus: (id: string, status: SupplierStatus) => api.patch<Supplier>(`${SUPPLIERS_URL}/${id}/status`, { status }),
  deleteSupplier: (id: string) => api.delete(`${SUPPLIERS_URL}/${id}`),
}; 