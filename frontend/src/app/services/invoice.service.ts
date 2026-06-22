import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private apiUrl = 'http://localhost:8081/sales/invoices';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('auth_token')
               ?? sessionStorage.getItem('auth_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  create(data: any): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, data, { headers: this.headers() });
  }

  getMine(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl, { headers: this.headers() });
  }

  getAll(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/all`, { headers: this.headers() });
  }

  getOne(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }

  updateStatus(id: number, status: string): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}/status`, { status }, { headers: this.headers() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }
}