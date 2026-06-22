export interface InvoiceItem {
  id?: number;
  productName: string;
  partNumber: string;
  billingCycle: string;
  term: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice {
  id?: number;
  invoiceNumber?: string;
  client?: { id: number; username: string; email: string };
  createdBy?: { id: number; username: string };
  items?: InvoiceItem[];
  totalAmount?: number;
  currency?: string;
  status?: string;
  issueDate?: string;
  dueDate?: string;
  notes?: string;
  createdAt?: string;
}