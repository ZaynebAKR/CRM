import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LicenseService } from '../../services/license.service';
import { AuthService } from '../../services/auth.service';
import { License } from '../../models/license.model';
import { Invoice } from '../../models/invoice.model';
import { loadStripe } from '@stripe/stripe-js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-client-dashboard',
  templateUrl: './client-dashboard.component.html',
  styleUrls: ['./client-dashboard.component.css']
})
export class ClientDashboardComponent implements OnInit {

  licenses: License[] = [];
  invoices: Invoice[] = [];
  loading = true;
  loadingInvoices = false;
  showRequestForm = false;
  activeTab: 'licenses' | 'invoices' = 'licenses';
  payingInvoice: Invoice | null = null;
  showPayModal = false;
  paymentLoading = false;
  paymentSuccess = false;
  selectedInvoice: Invoice | null = null;
  showDetailModal = false;
  successMessage = '';
  errorMessage = '';
  private stripe: any = null;
  private cardElement: any = null;

  private stripePublicKey = 'pk_test_51Qy2JjKpCQHkABgKARu62V68rkleu9aMJPS5sPQhG0i7llQ52C9wsHm5sPtwyg0C7sice93CFKXKVCqAAJhMX03X00oOdAFYjL';

  newLicense: License = {
    productName: '', partNumber: '', billingCycle: '', term: '',
    quantity: 1, unitPrice: 0, totalPrice: 0, currency: 'EUR',
    startDate: '', expiryDate: '', status: '', paymentStatus: ''
  };

  constructor(
    private licenseService: LicenseService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadMyLicenses();
    this.loadMyInvoices();
  }

  private headers(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadMyLicenses(): void {
    this.loading = true;
    this.licenseService.getMyLicenses().subscribe({
      next: (data) => { this.licenses = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  loadMyInvoices(): void {
    this.loadingInvoices = true;
    const user = this.authService.getUser();
    const clientId = (user as any)?.id;
    if (!clientId) { this.loadingInvoices = false; return; }

    this.http.get<Invoice[]>(
      `http://localhost:8081/sales/invoices/client/${clientId}`,
      { headers: this.headers() }
    ).subscribe({
      next: (data) => { this.invoices = data; this.loadingInvoices = false; },
      error: () => { this.loadingInvoices = false; }
    });
  }

  async payInvoice(inv: Invoice): Promise<void> {
    this.payingInvoice = inv;
    this.showPayModal = true;
    this.paymentLoading = true;
    this.paymentSuccess = false;

    try {
      const stripe = await loadStripe(this.stripePublicKey);
      if (!stripe) throw new Error('Stripe failed to load');

      const res: any = await this.http.post(
        'http://localhost:8081/api/stripe/create-payment-intent',
        { amount: inv.totalAmount, currency: inv.currency?.toLowerCase() || 'eur', invoiceId: inv.id },
        { headers: this.headers() }
      ).toPromise();

      const clientSecret = res.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: await this.getMockCard(stripe),
          billing_details: { name: this.authService.getUser()?.username }
        }
      });

      if (result.error) {
        this.showError(result.error.message || 'Payment failed.');
        this.showPayModal = false;
      } else if (result.paymentIntent?.status === 'succeeded') {
        await this.http.put(
          `http://localhost:8081/sales/invoices/${inv.id}/status`,
          { status: 'PAID' },
          { headers: this.headers() }
        ).toPromise();

        this.paymentSuccess = true;
        this.paymentLoading = false;
        this.showSuccess('Payment successful! Invoice marked as PAID.');
        this.loadMyInvoices();
      }
    } catch (e: any) {
      this.showError(e.message || 'Payment error.');
      this.showPayModal = false;
    } finally {
      this.paymentLoading = false;
    }
  }

  private async getMockCard(stripe: any): Promise<any> {
    const elements = stripe.elements();
    const cardElement = elements.create('card');
    return { card: cardElement };
  }

async openPayModal(inv: Invoice): Promise<void> {
  this.payingInvoice = inv;
  this.showPayModal = true;
  this.paymentSuccess = false;
  this.paymentLoading = false;
  setTimeout(async () => {
    this.stripe = await loadStripe(this.stripePublicKey);
    const elements = this.stripe.elements();
    this.cardElement = elements.create('card', {
      style: {
        base: { fontSize: '16px', color: '#333', '::placeholder': { color: '#aaa' } }
      }
    });
    this.cardElement.mount('#stripe-card-element');
    this.cardElement.on('change', (event: any) => {
      const el = document.getElementById('stripe-errors');
      if (el) el.textContent = event.error ? event.error.message : '';
    });
  }, 200);
}

async processStripePayment(): Promise<void> {
  if (!this.stripe || !this.cardElement || !this.payingInvoice) return;
  this.paymentLoading = true;

  try {
    const res: any = await this.http.post(
      'http://localhost:8081/api/stripe/create-payment-intent',
      {
        amount: this.payingInvoice.totalAmount,
        currency: this.payingInvoice.currency?.toLowerCase() || 'eur',
        invoiceId: this.payingInvoice.id
      },
      { headers: this.headers() }
    ).toPromise();

    const { error, paymentIntent } = await this.stripe.confirmCardPayment(res.clientSecret, {
      payment_method: { card: this.cardElement }
    });

    if (error) {
      const el = document.getElementById('stripe-errors');
      if (el) el.textContent = error.message;
      this.paymentLoading = false;
    } else if (paymentIntent?.status === 'succeeded') {
      await this.http.put(
        `http://localhost:8081/sales/invoices/${this.payingInvoice.id}/status`,
        { status: 'PAID' },
        { headers: this.headers() }
      ).toPromise();
      this.paymentSuccess = true;
      this.paymentLoading = false;
      this.loadMyInvoices();
    }
  } catch (e: any) {
    this.showError(e.message || 'Payment failed.');
    this.paymentLoading = false;
  }
}
  closePayModal(): void {
    this.showPayModal = false;
    this.payingInvoice = null;
    this.paymentSuccess = false;
  }

  downloadInvoicePDF(inv: Invoice): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(55, 138, 221);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INSOMEA COMPUTER SOLUTIONS', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Microsoft Cloud Gold Partner | info@insomea.com | +216 98 174 454', 14, 28);
    doc.text('Les Berges du Lac, Tunis 1053, Tunisia', 14, 35);

    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 14, 20, { align: 'right' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.invoiceNumber || '', pageWidth - 14, 30, { align: 'right' });

    doc.setFillColor(245, 247, 252);
    doc.rect(14, 48, 85, 40, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 138, 221);
    doc.setFontSize(10);
    doc.text('BILL TO', 18, 56);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.client?.username || '-', 18, 64);
    doc.text(inv.client?.email || '-', 18, 71);

    doc.setFillColor(245, 247, 252);
    doc.rect(pageWidth - 99, 48, 85, 40, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(55, 138, 221);
    doc.text('INVOICE DETAILS', pageWidth - 95, 56);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #:   ${inv.invoiceNumber || '-'}`, pageWidth - 95, 64);
    doc.text(`Issue Date:  ${inv.issueDate || '-'}`, pageWidth - 95, 71);
    doc.text(`Due Date:    ${inv.dueDate || '-'}`, pageWidth - 95, 78);

    const tableRows = (inv.items || []).map(item => [
      item.productName,
      item.partNumber,
      item.billingCycle,
      item.quantity?.toString() || '1',
      `${Number(item.unitPrice).toFixed(2)} ${inv.currency}`,
      `${Number(item.totalPrice).toFixed(2)} ${inv.currency}`
    ]);

autoTable(doc, {
  startY: 100,
  head: [['Product', 'Part #', 'Billing', 'Qty', 'Unit Price', 'Total']],
  body: tableRows,
  headStyles: { fillColor: [55, 138, 221], textColor: 255, fontStyle: 'bold', fontSize: 10 },
  bodyStyles: { fontSize: 9 },
  alternateRowStyles: { fillColor: [245, 247, 252] },
  margin: { left: 14, right: 14 }
});

const finalY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFillColor(55, 138, 221);
    doc.rect(pageWidth - 80, finalY, 66, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', pageWidth - 76, finalY + 9);
    doc.text(`${Number(inv.totalAmount).toFixed(2)} ${inv.currency}`, pageWidth - 16, finalY + 9, { align: 'right' });

    const footerY = doc.internal.pageSize.getHeight() - 16;
    doc.setFillColor(55, 138, 221);
    doc.rect(0, footerY - 4, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('INSOMEA COMPUTER SOLUTIONS — Microsoft Cloud Gold Partner', pageWidth / 2, footerY + 4, { align: 'center' });
    doc.text('www.insomea.com | info@insomea.com', pageWidth / 2, footerY + 9, { align: 'center' });

    doc.save(`${inv.invoiceNumber}.pdf`);
  }

  openDetail(inv: Invoice): void {
    this.selectedInvoice = inv;
    this.showDetailModal = true;
  }

  getStatusClass(license: License): string {
    if (this.isExpired(license.expiryDate)) return 'status-expired';
    if (this.isExpiringSoon(license.expiryDate)) return 'status-expiring';
    return 'status-active';
  }

  getPaymentClass(paymentStatus: string): string {
    if (paymentStatus === 'PAID') return 'payment-paid';
    if (paymentStatus === 'OVERDUE') return 'payment-overdue';
    return 'payment-pending';
  }

  getInvoiceStatusClass(status: string): string {
    const map: any = {
      DRAFT: 'status-draft', SENT: 'status-sent',
      PAID: 'status-paid', CANCELLED: 'status-cancelled'
    };
    return map[status] || '';
  }

  isExpiringSoon(expiryDate: string): boolean {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);
    return expiry <= in30Days && expiry >= today;
  }

  isExpired(expiryDate: string): boolean {
    return new Date(expiryDate) < new Date();
  }

  submitRequest(): void {
    this.licenseService.requestLicense(this.newLicense).subscribe({
      next: () => {
        this.showRequestForm = false;
        this.resetForm();
        this.loadMyLicenses();
        this.showSuccess('License requested successfully!');
      },
      error: () => this.showError('Error requesting license.')
    });
  }

  resetForm(): void {
    this.newLicense = {
      productName: '', partNumber: '', billingCycle: '', term: '',
      quantity: 1, unitPrice: 0, totalPrice: 0, currency: 'EUR',
      startDate: '', expiryDate: '', status: '', paymentStatus: ''
    };
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  }

  get activeLicenses(): number { return this.licenses.filter(l => !this.isExpired(l.expiryDate)).length; }
  get expiringSoonCount(): number { return this.licenses.filter(l => this.isExpiringSoon(l.expiryDate)).length; }
  get expiredCount(): number { return this.licenses.filter(l => this.isExpired(l.expiryDate)).length; }
  get pendingInvoices(): number { return this.invoices.filter(i => i.status === 'SENT').length; }
  get paidInvoices(): number { return this.invoices.filter(i => i.status === 'PAID').length; }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => this.errorMessage = '', 4000);
  }
}