import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { License } from '../models/license.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {

  private apiUrl = 'http://localhost:8081/licenses';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });
  }

  getMyLicenses(): Observable<License[]> {
    return this.http.get<License[]>(`${this.apiUrl}/my`, { headers: this.getHeaders() });
  }

  getAllLicenses(): Observable<License[]> {
    return this.http.get<License[]>(`${this.apiUrl}/all`, { headers: this.getHeaders() });
  }

  getExpiringLicenses(): Observable<License[]> {
    return this.http.get<License[]>(`${this.apiUrl}/expiring`, { headers: this.getHeaders() });
  }

  requestLicense(license: License): Observable<License> {
    return this.http.post<License>(`${this.apiUrl}/request`, license, { headers: this.getHeaders() });
  }

  updateStatus(id: number, status: string): Observable<License> {
    return this.http.put<License>(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  updatePaymentStatus(id: number, paymentStatus: string): Observable<License> {
    return this.http.put<License>(`${this.apiUrl}/${id}/payment`, { paymentStatus }, { headers: this.getHeaders() });
  }
}