import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username = '';
  password = '';
  rememberMe = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.redirectByRole(this.authService.getUser()?.role ?? '');
      return;
    }

    const saved = localStorage.getItem('rememberedUsername');
    if (saved) {
      this.username = saved;
      this.rememberMe = true;
    }
  }

  login() {
    if (!this.username) { alert("Veuillez entrer votre nom d'utilisateur !"); return; }
    if (!this.password)  { alert("Veuillez entrer votre mot de passe !"); return; }

    const data = {
      username: this.username,
      password: this.password,
      rememberMe: this.rememberMe  
    };

    this.http.post<any>('http://localhost:8081/auth/login', data).subscribe({
      next: (res) => {
        this.authService.saveSession(res.token, res.username, res.role, res.rememberMe, res.id );

        if (this.rememberMe) {
          localStorage.setItem('rememberedUsername', this.username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }

        this.redirectByRole(res.role);
      },
      error: (err) => {
        alert(err.error?.message ?? 'Invalid credentials');
      }
    });
  }

private redirectByRole(role: string) {
  const routes: Record<string, string> = {
    ADMIN:   '/dashboard',
    SALES:   '/insomea-dashboard',
    FINANCE: '/dashboard',
    TECH:    '/dashboard',
    CLIENT:  '/dashboard',
  };
  const path = routes[role];
  if (path) this.router.navigate([path]);
  else console.error('Role not recognized:', role);
}
}