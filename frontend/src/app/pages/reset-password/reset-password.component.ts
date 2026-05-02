import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  step = 1;
  code = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

ngOnInit() {
  this.code = (this.route.snapshot.queryParamMap.get('code') ?? '').trim().toUpperCase();
  if (!this.code) {
    alert("Lien de réinitialisation manquant ou invalide.");
  }
}

  resetPassword() {
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
        this.step = 2;
      },
      error: (err) => {
        this.loading = false;
        alert(err.error?.message ?? "Invalid or expired link.");
      }
    });
  }
}