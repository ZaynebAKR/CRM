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
    // If already logged in, redirect immediately
    if (this.authService.isLoggedIn()) {
      this.redirectByRole(this.authService.getUser()?.role ?? '');
      return;
    }

    // Pre-fill username only (never pre-fill password for security)
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
      rememberMe: this.rememberMe  // ✅ sent to backend
    };

    this.http.post<any>('http://localhost:8081/auth/login', data).subscribe({
      next: (res) => {
        // ✅ Save token in the right storage based on rememberMe
        this.authService.saveSession(res.token, res.username, res.role, res.rememberMe);

        // Keep pre-filling username convenience (separate from session)
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
      INSOMEA:               '/insomea-dashboard',
      PARTENAIRES_COMMERCIAUX: '/partenaires-dashboard',
      CLIENT:                '/client-dashboard',
      MICROSOFT:             '/microsoft-dashboard',
    };
    const path = routes[role];
    if (path) this.router.navigate([path]);
    else alert('Role not recognized');
  }
}