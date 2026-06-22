import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Product, ProductFilter } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class PricelistService {

  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadPricelist(): void {
    this.http.get<Product[]>('assets/pricelist.json').pipe(
      tap(products => this.productsSubject.next(products))
    ).subscribe();
  }

  getFilteredProducts(filter: ProductFilter): Observable<Product[]> {
    return this.products$.pipe(
      map(products => products.filter(p => {
        if (filter.search) {
          const q = filter.search.toLowerCase();
          if (!p.Name.toLowerCase().includes(q) &&
              !p.Family.toLowerCase().includes(q)) return false;
        }
        if (filter.family && p.Family !== filter.family) return false;
        if (filter.billingCycle && p.BillingCycle !== filter.billingCycle) return false;
        if (filter.productType && p.ProductType !== filter.productType) return false;
        return true;
      }))
    );
  }

  getFamilies(): Observable<string[]> {
    return this.products$.pipe(
      map(products => [...new Set(products.map(p => p.Family))].sort())
    );
  }
}