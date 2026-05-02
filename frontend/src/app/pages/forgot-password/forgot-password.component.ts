import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  step = 1; 
  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;

  constructor(private http: HttpClient, private router: Router) {}

requestReset() {
  if (!this.email) {
    alert("Veuillez entrer votre adresse email !");
    return;
  }
  this.loading = true;
  this.http.post<any>(
    "http://localhost:8081/auth/forgot-password",
    { email: this.email }
  ).subscribe({
    next: (res) => {
      console.log("✅ Reset response:", res);
      this.loading = false;
      this.step = 2;
    },
    error: (err) => {
      console.log("❌ Full error object:", err);
      console.log("❌ err.status:", err.status);
      console.log("❌ err.error:", err.error);
      this.loading = false;
      alert(err.error?.message ?? "Email non trouvé.");
    }
  });
}

verifyCode() {
  if (!this.code) {
    alert("Veuillez entrer le code reçu par email !");
    return;
  }
  this.loading = true;
  this.http.post("http://localhost:8081/auth/verify-reset-code", { code: this.code })
    .subscribe({
      next: () => {
        this.loading = false;
        this.step = 3; 
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.message ?? "Code invalide ou expiré.");
      }
    });
}

  resetPassword() {
      console.log("🔑 Code being sent:", this.code);
      console.log("🔑 Code length:", this.code?.length);
      
  if (!this.newPassword || !this.confirmPassword) {
    alert("Veuillez remplir tous les champs !");
    return;
  }
  if (this.newPassword !== this.confirmPassword) {
    alert("Les mots de passe ne correspondent pas !");
    return;
  }
  if (this.newPassword.length < 6) {
    alert("Le mot de passe doit contenir au moins 6 caractères !");
    return;
  }
  this.loading = true;
  this.http.post("http://localhost:8081/auth/reset-password", {
    code: this.code,      
    newPassword: this.newPassword
  }).subscribe({
    next: () => {
      this.loading = false;
      this.step = 4;
      setTimeout(() => this.router.navigate(['/login']), 2000);
    },
    error: (err) => {
      this.loading = false;
      alert(err.error?.message ?? "Erreur lors de la réinitialisation.");
    }
  });
}

}