import api from './config';
import { Invoice, Receipt } from '@/types';

const BILLING_URL = '/billing';
const INVOICES_URL = `${BILLING_URL}/invoices`;
const RECEIPTS_URL = `${BILLING_URL}/receipts`;

export const billingApi = {
  // Invoice endpoints
  getAllInvoices: () => api.get<Invoice[]>(INVOICES_URL),
  getInvoiceById: (id: string) => api.get<Invoice>(`${INVOICES_URL}/${id}`),
  createInvoice: (invoice: Omit<Invoice, '_id'>) => api.post<Invoice>(INVOICES_URL, invoice),
  updateInvoice: (id: string, invoice: Partial<Invoice>) => api.put<Invoice>(`${INVOICES_URL}/${id}`, invoice),
  deleteInvoice: (id: string) => api.delete(`${INVOICES_URL}/${id}`),
  markInvoiceAsPaid: (id: string) => api.patch<Invoice>(`${INVOICES_URL}/${id}/paid`),

  // Receipt endpoints
  getAllReceipts: () => api.get<Receipt[]>(RECEIPTS_URL),
  getReceiptById: (id: string) => api.get<Receipt>(`${RECEIPTS_URL}/${id}`),
  createReceipt: (receipt: Omit<Receipt, '_id'>) => api.post<Receipt>(RECEIPTS_URL, receipt),
  updateReceipt: (id: string, receipt: Partial<Receipt>) => api.put<Receipt>(`${RECEIPTS_URL}/${id}`, receipt),
  deleteReceipt: (id: string) => api.delete(`${RECEIPTS_URL}/${id}`),
  emailReceipt: (id: string, email: string) => api.post(`${RECEIPTS_URL}/${id}/email`, { email }),
}; 