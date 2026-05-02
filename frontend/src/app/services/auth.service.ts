import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  saveSession(token: string, username: string, role: string, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, token);
    storage.setItem(this.USER_KEY, JSON.stringify({ username, role }));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
        ?? sessionStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): { username: string; role: string } | null {
    const raw = localStorage.getItem(this.USER_KEY)
             ?? sessionStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    // Also clear old "remember username" key if it exists
    localStorage.removeItem('rememberedUsername');
  }
  
}
