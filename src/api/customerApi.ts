import { Customer } from '@/redux/slices/customerSlice';
import api from './config.ts';

const CUSTOMERS_URL = '/customers';

export const customerApi = {
  getAll: () => api.get<Customer[]>(CUSTOMERS_URL),
  getById: (id: string) => api.get<Customer>(`${CUSTOMERS_URL}/${id}`),
  create: (customer: Omit<Customer, '_id'>) => api.post<Customer>(CUSTOMERS_URL, customer),
  update: (id: string, customer: Partial<Customer>) => api.put<Customer>(`${CUSTOMERS_URL}/${id}`, customer),
  delete: (id: string) => api.delete(`${CUSTOMERS_URL}/${id}`),
}; 