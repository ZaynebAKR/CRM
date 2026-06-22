import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8081/admin/users';

  constructor(private http: HttpClient) {}

private headers(): HttpHeaders {
  const token = localStorage.getItem('auth_token') 
             ?? sessionStorage.getItem('auth_token');
  return new HttpHeaders({ Authorization: `Bearer ${token}` });
}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { headers: this.headers() });
  }

  getOne(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }

  create(data: any): Observable<User> {
    return this.http.post<User>(this.apiUrl, data, { headers: this.headers() });
  }

  update(id: number, data: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data, { headers: this.headers() });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.headers() });
  }
}