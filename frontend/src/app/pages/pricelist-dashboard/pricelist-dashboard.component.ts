import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { PricelistService } from '../../services/pricelist.service';
import { Product, ProductFilter } from '../../models/product.model';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
Chart.register(...registerables);

@Component({
  selector: 'app-pricelist-dashboard',
  templateUrl: './pricelist-dashboard.component.html',
  styleUrls: ['./pricelist-dashboard.component.css']
})
export class PricelistDashboardComponent implements OnInit {

  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;

  private barChart?: Chart;
  private donutChart?: Chart;

  products: Product[] = [];
  filteredProducts: Product[] = [];
  families: string[] = [];
  loading = true;

  currentPage = 1;
  readonly pageSize = 10;
  get totalPages(): number { return Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize)); }
  get pagedProducts(): Product[] {
    const s = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(s, s + this.pageSize);
  }

  filter: ProductFilter = { search: '', family: '', billingCycle: '', productType: '' };
  selectedProduct: Product | null = null;

  get totalProducts(): number { return this.products.length; }
  get avgPrice(): string { return this.products.length ? this.formatEur(this.products.reduce((a, b) => a + b.ListPrice, 0) / this.products.length) : '€0'; }
  get totalSubscriptions(): number { return this.products.filter(p => p.ProductType === 'Subscription').length; }
  get monthlyPct(): string { return this.products.length ? Math.round(this.products.filter(p => p.BillingCycle === 'Monthly').length / this.products.length * 100) + '%' : '0%'; }

  constructor(
  private pricelistService: PricelistService ,
  private authService: AuthService,
  private router: Router) {}

  ngOnInit(): void {
    this.pricelistService.loadPricelist();
    this.pricelistService.products$.subscribe(products => {
      this.products = products;
      this.filteredProducts = products;
      this.loading = false;
      setTimeout(() => this.buildCharts(), 100);
    });
    this.pricelistService.getFamilies().subscribe(f => this.families = f);
  }

  onFilterChange(): void {
    this.pricelistService.getFilteredProducts(this.filter).subscribe(products => {
      this.filteredProducts = products;
      this.currentPage = 1;
    });
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  openDetail(p: Product): void { this.selectedProduct = p; }
  closeDetail(): void { this.selectedProduct = null; }

  formatEur(v: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);
  }

  billingLabel(b: string): string {
    return b === 'Monthly' ? 'Mensuel' : b === 'Annual' ? 'Annuel' : '3 ans';
  }

  billingClass(b: string): string {
    return b === 'Monthly' ? 'tag-monthly' : b === 'Annual' ? 'tag-annual' : 'tag-three';
  }

  typeClass(t: string): string {
    return t === 'Subscription' ? 'tag-sub' : 'tag-addon';
  }

  private buildCharts(): void {
    if (!this.barCanvas?.nativeElement) return;

    const familyMap = new Map<string, number>();
    this.products.forEach(p => familyMap.set(p.Family, (familyMap.get(p.Family) || 0) + 1));
    const top8 = [...familyMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

    this.barChart?.destroy();
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: top8.map(f => f[0]),
        datasets: [{ label: 'Produits', data: top8.map(f => f[1]),
          backgroundColor: ['#1D9E75','#378ADD','#D85A30','#7F77DD','#D4537E','#BA7517','#639922','#888780'],
          borderRadius: 5 }]
      },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } } }
    });

    this.donutChart?.destroy();
    this.donutChart = new Chart(this.donutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['< €10', '€10-50', '€50-200', '€200-1k', '> €1k'],
        datasets: [{ data: [
          this.products.filter(p => p.ListPrice < 10).length,
          this.products.filter(p => p.ListPrice >= 10 && p.ListPrice < 50).length,
          this.products.filter(p => p.ListPrice >= 50 && p.ListPrice < 200).length,
          this.products.filter(p => p.ListPrice >= 200 && p.ListPrice < 1000).length,
          this.products.filter(p => p.ListPrice >= 1000).length,
        ], backgroundColor: ['#1D9E75','#378ADD','#7F77DD','#D85A30','#D4537E'], borderWidth: 2 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }
    });
  }
  logout() {
  this.authService.logout();
  this.router.navigate(['/login']);
}
}