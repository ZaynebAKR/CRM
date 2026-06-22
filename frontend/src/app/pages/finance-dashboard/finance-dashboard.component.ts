import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Invoice } from 'src/app/models/invoice.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-finance-dashboard',
  templateUrl: './finance-dashboard.component.html',
  styleUrls: ['./finance-dashboard.component.css']
})
export class FinanceDashboardComponent implements OnInit {

  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  loading = false;
  successMessage = '';
  errorMessage = '';
  selectedInvoice: Invoice | null = null;
  showDetailModal = false;
  filterStatus = 'ALL';
  searchText = '';
  today = new Date().toISOString().split('T')[0];

  statusOptions = ['ALL', 'DRAFT', 'SENT', 'PAID', 'CANCELLED'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  private headers(): HttpHeaders {
    const token = localStorage.getItem('auth_token')
               ?? sessionStorage.getItem('auth_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadInvoices(): void {
    this.loading = true;
    this.http.get<Invoice[]>('http://localhost:8081/sales/invoices/all', { headers: this.headers() }).subscribe({
      next: (data) => {
        this.invoices = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.errorMessage = 'Failed to load invoices.'; this.loading = false; }
    });
  }

  applyFilter(): void {
    let result = [...this.invoices];
    if (this.filterStatus !== 'ALL') {
      result = result.filter(i => i.status === this.filterStatus);
    }
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      result = result.filter(i =>
        i.invoiceNumber?.toLowerCase().includes(q) ||
        i.client?.username.toLowerCase().includes(q) ||
        i.createdBy?.username?.toLowerCase().includes(q)
      );
    }
    this.filteredInvoices = result;
  }

  openDetail(inv: Invoice): void {
    this.selectedInvoice = inv;
    this.showDetailModal = true;
  }

  markAsPaid(inv: Invoice): void {
    this.http.put<Invoice>(
      `http://localhost:8081/sales/invoices/${inv.id}/status`,
      { status: 'PAID' },
      { headers: this.headers() }
    ).subscribe({
      next: () => {
        this.showSuccess('Invoice marked as PAID.');
        this.showDetailModal = false;
        this.loadInvoices();
      },
      error: () => this.showError('Failed to update status.')
    });
  }

  // ── KPIs
  get totalInvoiced(): number {
    return this.invoices.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  }
  get totalPaid(): number {
    return this.invoices.filter(i => i.status === 'PAID')
      .reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  }
  get totalPending(): number {
    return this.invoices.filter(i => i.status === 'SENT')
      .reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  }
  get totalDraft(): number {
    return this.invoices.filter(i => i.status === 'DRAFT')
      .reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  }
  get countPaid(): number { return this.invoices.filter(i => i.status === 'PAID').length; }
  get countPending(): number { return this.invoices.filter(i => i.status === 'SENT').length; }
  get countDraft(): number { return this.invoices.filter(i => i.status === 'DRAFT').length; }
  get countCancelled(): number { return this.invoices.filter(i => i.status === 'CANCELLED').length; }

  getStatusClass(status: string): string {
    const map: any = {
      DRAFT: 'status-draft', SENT: 'status-sent',
      PAID: 'status-paid', CANCELLED: 'status-cancelled'
    };
    return map[status] || '';
  }

  downloadPDF(inv: Invoice): void {
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

    doc.setTextColor(255, 255, 255);
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
    doc.text(`Issue Date:  ${inv.issueDate || '-'}`, pageWidth - 95, 64);
    doc.text(`Due Date:    ${inv.dueDate || '-'}`, pageWidth - 95, 71);
    doc.text(`Status:      ${inv.status || '-'}`, pageWidth - 95, 78);

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Prepared by: ${inv.createdBy?.username || '-'}`, 14, 95);

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
      bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [245, 247, 252] },
      columnStyles: {
        0: { cellWidth: 60 },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold' }
      },
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

    if (inv.notes) {
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(`Notes: ${inv.notes}`, 14, finalY + 10);
    }

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

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
  private showError(msg: string): void {
    this.errorMessage = msg;
    setTimeout(() => this.errorMessage = '', 4000);
  }
}