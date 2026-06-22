import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InvoiceService } from 'src/app/services/invoice.service';
import { UserService, User } from 'src/app/services/user.service';
import { Invoice, InvoiceItem } from 'src/app/models/invoice.model';
import { Product } from 'src/app/models/product.model';

@Component({
  selector: 'app-sales-dashboard',
  templateUrl: './sales-dashboard.component.html',
  styleUrls: ['./sales-dashboard.component.css']
})
export class SalesDashboardComponent implements OnInit {

  invoices: Invoice[] = [];
  clients: User[] = [];
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';
  activeTab: 'list' | 'create' = 'list';
  showProductModal = false;
  showDetailModal = false;
  selectedInvoice: Invoice | null = null;
  searchInvoice = '';
  productSearch = '';
  showDeleteModal = false;
  invoiceToDelete: number | null = null;
  sendingStatus = false;
  form = {
    clientId: null as number | null,
    dueDate: '',
    notes: '',
    currency: 'EUR'
  };
  cartItems: (InvoiceItem & { productFamily?: string })[] = [];

  constructor(
    private invoiceService: InvoiceService,
    private userService: UserService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.loadClients();
    this.loadProducts();
  }

  loadInvoices(): void {
    this.loading = true;
    this.invoiceService.getMine().subscribe({
      next: (data) => { this.invoices = data; this.loading = false; },
      error: () => { this.errorMessage = 'Failed to load invoices.'; this.loading = false; }
    });
  }

loadClients(): void {
  const token = localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
  const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  this.http.get<User[]>('http://localhost:8081/admin/users/clients', { headers }).subscribe({
    next: (data) => this.clients = data,
    error: (err) => console.error('Failed to load clients', err)
  });
}

  loadProducts(): void {
    this.http.get<Product[]>('assets/pricelist.json').subscribe({
      next: (data) => { this.products = data; this.filteredProducts = data; }
    });
  }

  searchProducts(): void {
    const q = this.productSearch.toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      p.Name.toLowerCase().includes(q) ||
      p.Family.toLowerCase().includes(q) ||
      p.PartNumber.toLowerCase().includes(q)
    );
  }

  addToCart(product: Product): void {
    const existing = this.cartItems.find(i => i.partNumber === product.PartNumber);
    if (existing) {
      existing.quantity++;
      existing.totalPrice = existing.quantity * existing.unitPrice;
    } else {
      this.cartItems.push({
        productName: product.Name,
        partNumber: product.PartNumber,
        billingCycle: product.BillingCycle,
        term: product.Term,
        quantity: 1,
        unitPrice: product.ListPrice,
        totalPrice: product.ListPrice,
        productFamily: product.Family
      });
    }
  }

  updateQuantity(item: InvoiceItem, qty: number): void {
    if (qty < 1) return;
    item.quantity = qty;
    item.totalPrice = qty * item.unitPrice;
  }

  removeFromCart(index: number): void {
    this.cartItems.splice(index, 1);
  }

  get cartTotal(): number {
    return this.cartItems.reduce((sum, i) => sum + i.totalPrice, 0);
  }

  submitInvoice(): void {
    if (!this.form.clientId) { this.errorMessage = 'Please select a client.'; return; }
    if (this.cartItems.length === 0) { this.errorMessage = 'Add at least one product.'; return; }
    if (!this.form.dueDate) { this.errorMessage = 'Please set a due date.'; return; }

    const payload = {
      clientId: this.form.clientId,
      dueDate: this.form.dueDate,
      notes: this.form.notes,
      currency: this.form.currency,
      items: this.cartItems.map(i => ({
        productName: i.productName,
        partNumber: i.partNumber,
        billingCycle: i.billingCycle,
        term: i.term,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice
      }))
    };

    this.invoiceService.create(payload).subscribe({
      next: () => {
        this.showSuccess('Invoice created successfully!');
        this.resetForm();
        this.activeTab = 'list';
        this.loadInvoices();
      },
      error: (err) => this.showError(err.error?.message || 'Failed to create invoice.')
    });
  }

  resetForm(): void {
    this.form = { clientId: null, dueDate: '', notes: '', currency: 'EUR' };
    this.cartItems = [];
    this.productSearch = '';
    this.filteredProducts = this.products;
  }

  get filteredInvoices(): Invoice[] {
    const q = this.searchInvoice.toLowerCase();
    return this.invoices.filter(inv =>
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.client?.username.toLowerCase().includes(q) ||
      inv.status?.toLowerCase().includes(q)
    );
  }

  openDetail(inv: Invoice): void {
    this.selectedInvoice = inv;
    this.showDetailModal = true;
  }

updateStatus(inv: Invoice, status: string): void {
  this.invoiceService.updateStatus(inv.id!, status).subscribe({
    next: () => {
      this.showSuccess(status === 'SENT' ? 'Invoice sent! Email delivered to client.' : 'Status updated.');
      this.showDetailModal = false;
      this.loadInvoices();
    },
    error: () => this.showError('Failed to update status.')
  });
}

confirmDelete(id: number): void {
  this.invoiceToDelete = id;
  this.showDeleteModal = true;
}
executeDelete(): void {
  if (this.invoiceToDelete === null) return;
  this.invoiceService.delete(this.invoiceToDelete).subscribe({
    next: () => {
      this.showSuccess('Invoice deleted.');
      this.showDeleteModal = false;
      this.invoiceToDelete = null;
      this.loadInvoices();
    },
    error: () => this.showError('Failed to delete.')
  });
}


  getStatusClass(status: string): string {
    const map: any = {
      DRAFT: 'status-draft', SENT: 'status-sent',
      PAID: 'status-paid', CANCELLED: 'status-cancelled'
    };
    return map[status] || '';
  }

  getClientName(id: number): string {
    return this.clients.find(c => c.id === id)?.username || 'Unknown';
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }

  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => this.errorMessage = '', 4000);
  }
}