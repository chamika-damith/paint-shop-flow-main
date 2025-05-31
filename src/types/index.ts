// Inventory Types
export interface InventoryItem {
  _id?: string;  // MongoDB ID
  id?: string;   // For compatibility
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  description?: string;
  reorderPoint?: number;
  lastRestocked?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
}

// Supplies Types
export interface Supply {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
  customer: string;
  customerStatus: 'Active' | 'Inactive' | 'On Hold';
}

export interface SuppliesState {
  supplies: Supply[];
  loading: boolean;
  error: string | null;
}

// Billing Types
export interface InvoiceItem {
  item: string; // MongoDB ObjectId
  quantity: number;
  price: number;
}

export interface Invoice {
  _id: string;
  customer: string;
  date: Date | string;
  dueDate?: Date | string;
  paymentDate?: Date | string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  items: InvoiceItem[];
  notes?: string;
  paymentTerms?: string;
  paymentMethod?: string;
}

export interface Receipt {
  _id: string;
  customer: string;
  date: string;
  amount: number;
  items: number;
  invoice: string; // Reference to Invoice._id
}

export interface BillingState {
  invoices: Invoice[];
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
}

export const SUPPLIER_CATEGORIES = [
  'Paint Manufacturers',
  'Canvas Suppliers',
  'Brush Manufacturers',
  'Tool Suppliers',
  'Equipment Vendors',
  'Art Materials',
  'Packaging Suppliers',
  'Safety Equipment',
  'General Supplies'
] as const;

export type SupplierCategory = typeof SUPPLIER_CATEGORIES[number];
export type SupplierStatus = 'Active' | 'Inactive' | 'On Hold';

export interface Supplier {
  _id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: SupplierCategory;
  status: SupplierStatus;
  inventoryItems: InventoryItem[];
  totalItems: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierState {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
}

export interface Notification {
  _id: string;
  type: 'Low Stock Alert';
  supplier: {
    _id: string;
    name: string;
    email: string;
  };
  items: Array<{
    item: {
      _id: string;
      name: string;
      category: string;
    };
    name: string;
    quantity: number;
    category: string;
    status: string;
  }>;
  sentTo: string;
  status: 'Sent' | 'Failed';
  sentAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
} 