  import { Injectable } from '@angular/core';

  @Injectable({
    providedIn: 'root'
  })
  export class AuthService {


    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'auth_user';

  saveSession(token: string, username: string, role: string, rememberMe: boolean, id: number): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, token);
    storage.setItem(this.USER_KEY, JSON.stringify({ id, username, role }));
  }

  getUser(): { id: number; username: string; role: string } | null {
    const raw = localStorage.getItem(this.USER_KEY)
            ?? sessionStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

    getToken(): string | null {
      return localStorage.getItem(this.TOKEN_KEY)
          ?? sessionStorage.getItem(this.TOKEN_KEY);
    }


    isLoggedIn(): boolean {
      return !!this.getToken();
    }

    logout(): void {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
      localStorage.removeItem('rememberedUsername');
    }
    
  }
