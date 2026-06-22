import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { PricelistService } from '../../services/pricelist.service';
import { Product } from '../../models/product.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
interface CartItem {
  product: Product;
  quantity: number;
}

interface Optimization {
  type: string;
  message: string;
  saving?: string;
  action: string;
}

interface AiResult {
  optimizations: Optimization[];
  summary: string;
  totalCurrent: number;
  totalOptimized: number;
}

@Component({
  selector: 'app-ai-optimizer',
  templateUrl: './ai-optimizer.component.html',
  styleUrls: ['./ai-optimizer.component.css']
})
export class AiOptimizerComponent implements OnInit {

  role: string = '';
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchQuery: string = '';

  cart: CartItem[] = [];
  loading = false;
  analyzing = false;
  aiResult: AiResult | null = null;
  errorMessage: string = '';
  saveSuccess: boolean = false;

  manualInput: string = '';

  constructor(
    private authService: AuthService,
    private pricelistService: PricelistService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getUser()?.role || '';
    if (this.role === 'SALES') {
      this.pricelistService.loadPricelist();
      this.pricelistService.products$.subscribe(p => {
        this.products = p;
        this.filteredProducts = p.slice(0, 20);
      });
    }
  }

  searchProducts(): void {
    if (!this.searchQuery.trim()) {
      this.filteredProducts = this.products.slice(0, 20);
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredProducts = this.products
      .filter(p => p.Name.toLowerCase().includes(q) || p.Family.toLowerCase().includes(q))
      .slice(0, 20);
  }

  addToCart(product: Product): void {
    const existing = this.cart.find(item => item.product.PartNumber === product.PartNumber);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
  }

  updateQuantity(index: number, qty: number): void {
    if (qty < 1) return;
    this.cart[index].quantity = qty;
  }

  get cartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.product.ListPrice * item.quantity, 0);
  }

  formatEur(v: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);
  }

  async analyzeCart(): Promise<void> {
    if (this.cart.length === 0 && this.role === 'SALES') {
      this.errorMessage = 'Please add products to your cart first.';
      return;
    }

    this.analyzing = true;
    this.aiResult = null;
    this.errorMessage = '';

    try {
      let prompt = '';

      if (this.role === 'SALES') {
        const cartDesc = this.cart.map(item =>
          `- ${item.quantity}x ${item.product.Name} (${item.product.Family}, ${item.product.BillingCycle}, €${item.product.ListPrice}/user) = €${(item.product.ListPrice * item.quantity).toFixed(2)}/month`
        ).join('\n');

        prompt = `You are a Microsoft NCE license optimization expert working for INSOMEA, a Microsoft Gold Partner.

Analyze this sales cart and provide optimization recommendations:

CURRENT CART:
${cartDesc}
TOTAL: €${this.cartTotal.toFixed(2)}/month

Available Microsoft product families include: Microsoft 365, Office 365, Teams, Dynamics 365, Windows 365, Defender, Intune, Exchange Online, SharePoint, Power BI, etc.

Provide your analysis in this exact JSON format (no markdown, no backticks, just pure JSON):
{
  "optimizations": [
    {
      "type": "BUNDLE_UPGRADE or REDUNDANCY or BILLING_OPTIMIZATION or BETTER_PLAN",
      "message": "Clear explanation of the issue and recommendation",
      "saving": "Estimated saving amount or percentage",
      "action": "REPLACE or REMOVE or CHANGE_BILLING or CONSIDER"
    }
  ],
  "summary": "One sentence overall assessment",
  "totalCurrent": ${this.cartTotal.toFixed(2)},
  "totalOptimized": estimated_optimized_total_as_number
}

If the cart is already well optimized, say so in the summary and return empty optimizations array.`;

      } /* */ else if (this.role === 'ADMIN') {
        prompt = `You are a Microsoft NCE license optimization expert for INSOMEA.

An admin has described the following client license situation:
${this.manualInput}

Analyze and provide audit recommendations in this exact JSON format (no markdown, no backticks, just pure JSON):
{
  "optimizations": [
    {
      "type": "OVER_LICENSED or WRONG_PLAN or RENEWAL_OPTIMIZATION or COST_SAVING",
      "message": "Clear explanation with specific recommendation",
      "saving": "Estimated monthly/annual saving",
      "action": "REDUCE or DOWNGRADE or RENEGOTIATE or REVIEW"
    }
  ],
  "summary": "Overall audit assessment in one sentence",
  "totalCurrent": 0,
  "totalOptimized": 0
}`;

      } else if (this.role === 'CLIENT') {
        prompt = `You are a Microsoft license advisor at INSOMEA helping a client review their licenses.

The client describes their situation:
${this.manualInput}

Provide friendly optimization advice in this exact JSON format (no markdown, no backticks, just pure JSON):
{
  "optimizations": [
    {
      "type": "UNUSED or OVER_LICENSED or BETTER_PLAN or COST_SAVING",
      "message": "Simple, clear explanation and what the client should consider",
      "saving": "Potential saving estimate",
      "action": "CONSIDER or REVIEW_WITH_ADMIN or DOWNGRADE"
    }
  ],
  "summary": "Brief friendly summary",
  "totalCurrent": 0,
  "totalOptimized": 0
}`;
      } 

const token = this.authService.getToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      const data: any = await this.http.post(
        'http://localhost:8081/api/ai-analysis/ask',
        { prompt },
        { headers }
      ).toPromise();

      const cleaned = data.content.replace(/```json|```/g, '').trim();
      this.aiResult = JSON.parse(cleaned);

    } catch (err) {
      this.errorMessage = 'Analysis failed. Please try again.';
      console.error(err);
    } finally {
      this.analyzing = false;
    }
  }

  clearAll(): void {
    this.cart = [];
    this.aiResult = null;
    this.errorMessage = '';
    this.manualInput = '';
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'REMOVE': return '#ef4444';
      case 'REPLACE': return '#f59e0b';
      case 'CHANGE_BILLING': return '#3b82f6';
      case 'CONSIDER': return '#8b5cf6';
      default: return '#10b981';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'BUNDLE_UPGRADE': return '📦';
      case 'REDUNDANCY': return '⚠️';
      case 'BILLING_OPTIMIZATION': return '💳';
      case 'BETTER_PLAN': return '⬆️';
      case 'OVER_LICENSED': return '📉';
      case 'WRONG_PLAN': return '🔄';
      case 'UNUSED': return '💤';
      case 'COST_SAVING': return '💰';
      default: return '🤖';
    }
  }
saveAnalysis(): void {
  const user = this.authService.getUser();
  if (!user || !this.aiResult) return;

  const inputText = this.role === 'SALES'
    ? this.cart.map(i => `${i.quantity}x ${i.product.Name}`).join(', ')
    : this.manualInput;

  const payload = {
    userRole: this.role,
    userId: user.id,
    username: user.username,
    input: inputText,
    summary: this.aiResult.summary,
    recommendationsCount: this.aiResult.optimizations.length,
    totalCurrent: this.aiResult.totalCurrent,
    totalOptimized: this.aiResult.totalOptimized,
    resultJson: JSON.stringify(this.aiResult)
  };

  const token = this.authService.getToken();
  const headers = { 'Authorization': `Bearer ${token}` };

  this.http.post('http://localhost:8081/api/ai-analysis/save', payload, { headers })
    .subscribe({
      next: () => {
        this.saveSuccess = true;
        setTimeout(() => this.saveSuccess = false, 3000);
      },
      error: (err) => console.error('Save failed', err)
    });
}

exportPDF(): void {
  if (!this.aiResult) return;
  const result = this.aiResult;
  const user = this.authService.getUser();

  const doc = new jsPDF();

  doc.setFillColor(29, 158, 117);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AI License Optimization Report', 14, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated by: ${user?.username || ''} (${this.role})`, 14, 23);
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  const summaryLines = doc.splitTextToSize(result.summary, 180);
  doc.text(summaryLines, 14, 58);

  let yPos = 75;

  if (this.role === 'SALES' && this.cart.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Cart Analysis', 14, yPos);
    yPos += 8;

    const cartRows = this.cart.map(item => [
      item.product.Name,
      item.product.Family,
      item.product.BillingCycle,
      item.quantity.toString(),
      this.formatEur(item.product.ListPrice),
      this.formatEur(item.product.ListPrice * item.quantity)
    ]);

autoTable(doc, {
  startY: yPos,
  head: [['Product', 'Family', 'Billing', 'Qty', 'Unit Price', 'Total']],
  body: cartRows,
  theme: 'striped',
  headStyles: { fillColor: [29, 158, 117] },
  styles: { fontSize: 8 },
  margin: { left: 14 }
});

yPos = (doc as any).lastAutoTable.finalY + 10;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Current Total: ${this.formatEur(result.totalCurrent)}/month`, 14, yPos);

    if (result.totalOptimized > 0 && result.totalOptimized < result.totalCurrent) {
      yPos += 7;
      doc.setTextColor(29, 158, 117);
      doc.text(`Optimized Total: ${this.formatEur(result.totalOptimized)}/month`, 14, yPos);
      yPos += 7;
      doc.setTextColor(239, 68, 68);
      doc.text(`Potential Saving: ${this.formatEur(result.totalCurrent - result.totalOptimized)}/month`, 14, yPos);
    }
    yPos += 15;
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommendations', 14, yPos);
  yPos += 8;

  if (result.optimizations.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('No optimizations needed. Configuration is well optimized.', 14, yPos);
  } else {
    const optRows = result.optimizations.map(opt => [
      opt.type.replace('_', ' '),
      opt.action,
      opt.message,
      opt.saving || 'N/A'
    ]);

autoTable(doc, {
  startY: yPos,
  head: [['Type', 'Action', 'Recommendation', 'Saving']],
  body: optRows,
  theme: 'striped',
  headStyles: { fillColor: [55, 138, 221] },
  styles: { fontSize: 8, cellPadding: 3 },
  columnStyles: { 2: { cellWidth: 80 } },
  margin: { left: 14 }
});
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'AI recommendations are for guidance only. Always verify with Microsoft licensing documentation.',
    14, 285
  );

  doc.save(`AI_Optimization_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
}