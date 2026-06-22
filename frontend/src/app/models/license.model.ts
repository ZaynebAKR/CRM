export interface License {
  id?: number;
  userId?: number;
  productName: string;
  partNumber: string;
  billingCycle: string;
  term: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  startDate: string;
  expiryDate: string;
  status: string;
  paymentStatus: string;
  createdAt?: string;
  deploymentStatus?: string;
  deploymentNote?: string;
  user?: { id: number; username: string; email: string };
}