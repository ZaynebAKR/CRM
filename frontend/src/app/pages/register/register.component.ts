import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  username = "";
  email = "";
  password = "";
  confirmPassword = "";
  role = "CLIENT";

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    if (!this.username) { alert("Veuillez entrer un nom d'utilisateur !"); return; }
    if (!this.email) { alert("Veuillez entrer votre email !"); return; }
    if (!this.password) { alert("Veuillez entrer un mot de passe !"); return; }
    if (!this.confirmPassword) { alert("Veuillez confirmer votre mot de passe !"); return; }
    if (this.password !== this.confirmPassword) { alert("Les mots de passe ne correspondent pas !"); return; }
    if (this.password.length < 6) { alert("Le mot de passe doit contenir au moins 6 caractères !"); return; }
    if (!this.role) { alert("Veuillez choisir un rôle !"); return; }

    const data = {
      username: this.username,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      role: this.role
    };

    this.http.post("http://localhost:8081/auth/register", data)
      .subscribe({
        next: () => {
          alert("Registered successfully!");
          this.router.navigate(['/login']);
        },
        error: (err) => {
          alert(err.error?.message ?? "Registration failed!");
        }
      });
  }
}